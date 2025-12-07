export const CSV_EXTRACTION_PROMPT = `You will receive an image that contains tabular data.
Your task is to extract the table exactly and output it ONLY as CSV text, so it can be directly copy-pasted into Excel with no additional formatting.

Follow these rules strictly:

Output format
Use comma-separated values (CSV).
Each row in the table = one line in the output.
Do not add any explanations, comments, headings, or code fences.
✅ Correct: Header1,Header2,Header3
Row1Col1,Row1Col2,Row1Col3
❌ Incorrect: "Here is your table:", csv or any extra text.

Columns and rows
Keep the same column order as in the image (left to right).
Keep the same row order (top to bottom).
If a cell is empty, output nothing between the commas (e.g. A,,C).
If there are multiple tables, output them one after another separated by one blank line.

Headers & merged cells
If the table has a header row, include it as the first row in the CSV.
If a cell is visually merged across columns, repeat the same text in each corresponding column.
If a cell is merged across rows, repeat the value in each corresponding row.

Text handling
Preserve the exact text content of each cell (including symbols like %, +, -, ₹, $, etc.).
Keep numbers, dates, and percentages exactly as shown.
If a cell contains a comma, wrap the entire cell value in double quotes, e.g.:
Company,"Revenue, FY24",Profit
Trim unnecessary leading/trailing spaces.

No extra output
Do not describe the table.
Do not mention the image.
Do not add summary lines.
Final answer must be pure CSV only.`;
