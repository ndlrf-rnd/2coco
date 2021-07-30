set -e


echo "XML files to process: $(find ../DATA/ -type f -name '*.xml' | wc -l )"

find '../DATA/' -type f -name '*.xml' -exec grep -m 1 -l 'SeparatorRegion' {} \; > './datasets-files-with-SeparatorRegion.txt'


echo "Extracting filder names..."

while IFS="" read -r p || [ -n "$p" ]; do
  printf "$(dirname "$p")\n"
done < './datasets-files-with-SeparatorRegion.txt' > './datasets-folders-with-SeparatorRegion.txt'


echo "Aggregating..."

uniq --count < sort < './datasets-folders-with-SeparatorRegion.txt' > './datasets-folders-with-SeparatorRegion-agg.txt'
