import { ComponentPage, DemoSection } from "./component-page"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TablePage() {
  return (
    <ComponentPage
      title="Table"
      description="A responsive table component for displaying data."
    >
      <DemoSection title="Default">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>jane@example.com</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob Johnson</TableCell>
              <TableCell>Inactive</TableCell>
              <TableCell>bob@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DemoSection>
    </ComponentPage>
  )
}
