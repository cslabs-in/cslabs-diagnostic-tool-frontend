import { Card } from "../ui/Card";

/**
 * ReportBlock -- renders `report_text` (report.py's generate_report()
 * output) as styled prose, per frontend-v1-decisions.md §12's locked V1
 * decision. This is NOT a parser that re-derives structure from the text --
 * it only splits on the blank-line paragraph breaks that generate_report()
 * itself already uses ("\n\n".join(lines)), and renders the literal "---"
 * separator line as a visual divider. No other structural assumptions are
 * made about the content -- the report copy logic stays entirely in
 * report.py, this component just displays it.
 */
export interface ReportBlockProps {
  reportText: string;
}

export function ReportBlock({ reportText }: ReportBlockProps) {
  const paragraphs = reportText.split("\n\n");

  return (
    <Card className="space-y-4">
      {paragraphs.map((para, i) =>
        para.trim() === "---" ? (
          <hr key={i} className="border-border" />
        ) : (
          <p key={i} className="whitespace-pre-line text-sm leading-relaxed text-ink">
            {para}
          </p>
        ),
      )}
    </Card>
  );
}