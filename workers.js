const cluster = require('cluster');
const os = require('os');

const DEFAULT_JOBS = Math.max(2, parseInt(process.env.JOBS, 10) || (os.cpus().length - 1));
const WORKER_SYNC = process.env.WORKER_SYNC || (process.env.NODE_ENV === 'test');

const info = (...args) => process.stdout.write(`${args.map(v => `${v}`).join(' ')}\n`);
const warn = (...args) => process.stderr.write(`${args.map(v => `${v}`).join(' ')}\n`);
const error = (...args) => process.stderr.write(`ERROR: ${args.map(v => `${v}`).join(' ')}\n`);
const forceArray = (x) => (Array.isArray(x) ? x : [x].filter((v) => !!v));
const isError = (obj) => (Object.prototype.toString.call(obj) === '[object Error]');
const flattenDeep = arr => {
  let flattened = [];
  for (const a of arr) {
    if (Array.isArray(a)) {
      flattened = [...flattened, ...a];
      flattened = [...flattenDeep(flattened)]
    } else {
      flattened.push(a);
    }
  }
  return flattened;
}

global.WORKERS = [];
global.WORKERS_ONLINE = 0;
global.TASK_TYPE_HANDLERS = {}; // Type handling function
global.TASK_HANDLERS = []; // Single task handler
global.TASK_HANDLER = null; // Curent task handler
global.TASK_ID_SERIAL = 0;
global.JOBS = DEFAULT_JOBS;

const initWorker = (handlers = global.TASK_TYPE_HANDLERS, jobs = DEFAULT_JOBS) => {
  global.TASK_TYPE_HANDLERS = handlers;
  if (cluster.isMaster) {
    global.JOBS = ((typeof jobs !== 'number') || (jobs <= 0)) ? DEFAULT_JOBS : jobs;
  } else if (cluster.isWorker) {
    process.on(
      'message',
      ({task, data, ctx, workerId, taskId}) => {
        const onWorkerError = (err) => {
          const errorStr = isError(err) ? `${err.message}\n${err.stack}\n` : `${err}\n`;
          process.stderr.write(`[WORKER:${process.pid}] ERROR: ${errorStr}\n`);
          process.send({
            task, // task type
            ctx,
            error: errorStr,
            workerId,
            taskId,
            progress: 1,
          });
        };
        const handler = global.TASK_TYPE_HANDLERS[task];
        if (typeof handler === 'undefined') {
          onWorkerError(new Error(`[CLUSTER:${process.pid}] No such task registered: ${task}`));
        }
        handler(data, ctx, workerId).catch(onWorkerError).then(
          (responseData) => process.send(
            {
              task,
              ctx,
              data: responseData,
              workerId,
              taskId,
            },
          ),
        );
      },
    );
  }
};


const processQueue = () => {
  if (cluster.isMaster) {
    if ((!global.TASK_HANDLER) && (global.TASK_HANDLERS.length > 0)) {
      global.TASK_HANDLER = global.TASK_HANDLERS.pop();
      const {inputArr, task, ctx} = global.TASK_HANDLER;
      const chunkSize = Math.ceil(inputArr.length / global.JOBS);
      // Round-robin distribute data items to process
      const workerData = []
      for (let i = 0; i < inputArr.length; i += 1) {
        const assignToWorkerId = i % global.WORKERS.length;
        if (!workerData[assignToWorkerId]) {
          workerData[assignToWorkerId] = [inputArr[i]]
        } else {
          workerData[assignToWorkerId].push(inputArr[i])
        }
      }
      const assignees = (inputArr.length >= global.WORKERS.length)
          ? global.WORKERS
          : global.WORKERS.slice(0, inputArr.length);

              info(`[CLUSTER:${process.pid}] Starting execution of task "${task}" (${forceArray(inputArr).length} records) using ${assignees.length} workers\n`);
      assignees.forEach(
        (w, idx) => {
          const data = workerData[idx]
          w.send({
            task,
            ctx,
            jobs: assignees.length,
            taskId: global.TASK_ID_SERIAL,
            workerId: idx,
            data,
          });
        },
      );
    }
  }
};

const tryFinalizeCurrent = () => {
  if (global.TASK_HANDLER) {
    if ((global.TASK_HANDLER.tasksSuccessful + global.TASK_HANDLER.tasksFailed) === global.TASK_HANDLER.jobs) {
      global.TASK_ID_SERIAL += 1;
      const runTimeSec = (new Date()).getTime() / 1000 - global.TASK_HANDLER.startTsSec;
      const _resolve = global.TASK_HANDLER.resolve;
      const _reject = global.TASK_HANDLER.resolve;
      const _tasksFailed = global.TASK_HANDLER.tasksFailed;
      const recPerSec = global.TASK_HANDLER.recordsCount / (runTimeSec || (1 / 1000));
      const results = flattenDeep(global.TASK_HANDLER.results);
      global.TASK_HANDLER = null;
      process.stderr.write(`[CLUSTER:${process.pid}] Finished task in ${runTimeSec.toFixed(3)} seconds (${recPerSec.toFixed(1)} rec/sec)\n`);
      setImmediate(processQueue);
      if (_tasksFailed === 0) {
        _resolve(results);
      } else {
        _reject();
      }
    }
  }
};
const onWorkerError = (err) => {
  error(`[WORKER:${process.pid}] ERROR:\n${err}`);
  if (global.TASK_HANDLER) {

    global.TASK_HANDLER.tasksFailed += 1;
  }
  tryFinalizeCurrent();
};

const onWorkerDisconnect = (err) => {
  if (err) {
    error(`[WORKER:${process.pid}] DISCONNECTED ERROR:\n${err}`);
  } else {
    error(`[WORKER:${process.pid}] DISCONNECTED`);
  }
  if (global.TASK_HANDLER) {
    global.TASK_HANDLER.tasksFailed += 1;
  }
  tryFinalizeCurrent();
};


const onWorkerMessage = (m) => {
  if (!global.TASK_HANDLER) {
    const msg = `[WORKER:${process.pid}] Mismatch task serial ${m.taskId}`;
    error(msg);
  }
  if (m.error) {
    error(m);
    if (global.TASK_HANDLER) {
      global.TASK_HANDLER.tasksFailed += 1;
      global.TASK_HANDLER.results[m.workerId] = m;
    }
  } else {
    if (global.TASK_HANDLER) {
      global.TASK_HANDLER.tasksSuccessful += 1;
      global.TASK_HANDLER.results[m.workerId] = m.data;
    }
  }
  tryFinalizeCurrent();
};


const executeParallel = (
  task,
  inputArr,
  ctx = {},
) => new Promise(
  (resolve, reject) => {
    if (inputArr.length === 0) {
      resolve([]);
    } else {

      if (ctx.sync || WORKER_SYNC) {
        const handler = global.TASK_TYPE_HANDLERS[task];
        if (typeof handler === 'undefined') {
          reject(new Error(`[CLUSTER:${process.pid}] No such task registered: ${task}`));
        } else {
          handler(inputArr, ctx).catch(reject).then(res => resolve(forceArray([res])));
        }
      } else if (cluster.isMaster) {


        info(`[CLUSTER:${process.pid}] Scheduling task "${task}" to process ${forceArray(inputArr).length} records\n`);
        global.TASK_HANDLERS.push(
          {
            results: new Array(global.JOBS),
            resolve,
            reject,
            task,
            taskId: global.TASK_ID_SERIAL,
            recordsCount: forceArray(inputArr).length,
            startTsSec: (new Date()).getTime() / 1000,
            jobs: Math.min(global.JOBS, inputArr.length)  ,
            inputArr,
            ctx,
            tasksFailed: 0,
            tasksSuccessful: 0,
          },
        );

        if (global.WORKERS.length === 0) {
          const onWorkerOnline = () => {
            global.WORKERS_ONLINE += 1;
            if (global.WORKERS_ONLINE === global.JOBS) {
              setImmediate(processQueue);
            }
          };
          // Start additional workers
          for (let i = global.WORKERS.length; i < global.JOBS; i += 1) {
            if (process.env.DEBUG) {
              process.stderr.write(`[CLUSTER:${process.pid}] Forking cluster worker ${i + 1} / ${global.JOBS}\n`);
            }
            const worker = cluster.fork();
            global.WORKERS.push(worker);

            worker.on('error', onWorkerError);
            worker.on('message', onWorkerMessage);
            worker.on('online', onWorkerOnline);
            worker.on('disconnect', onWorkerDisconnect);
          }
        } else {
          setImmediate(processQueue);
        }
      }
    }
  },
);

module.exports = {
  initWorker,
  executeParallel,
};
