import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IRubrics } from "@/types/Classroom";

interface PropTypes {
  rubrics: IRubrics[];
}

export default function AssignmentRubricSection({ rubrics }: PropTypes) {
  const totalScore = rubrics.reduce((sum, r) => sum + r.score, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Rubrik</TableHead>
          <TableHead className="text-right">Skor Maksimal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rubrics.map((rubric) => (
          <TableRow key={rubric.id}>
            <TableCell>{rubric.name}</TableCell>
            <TableCell className="text-right">{rubric.score}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="font-bold">Total</TableCell>
          <TableCell className="text-right font-bold">{totalScore}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
