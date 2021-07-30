set -e


echo "XML files to process: $(find ../DATA/ -type f -name '*.xml' | wc -l )"

find '../DATA/' -type f -name '*.xml' -exec grep -m 1 -l 'Baseline' {} \; > './datasets-files-with-baseline.txt'


echo "Extracting filder names..."

while IFS="" read -r p || [ -n "$p" ]; do
  printf "$(dirname "$p")\n"
done < './datasets-files-with-baseline.txt' > './datasets-folders-with-baseline.txt'


echo "Aggregating..."

uniq --count < sort < './datasets-folders-with-baseline.txt' > './datasets-folders-with-baseline-agg.txt'
