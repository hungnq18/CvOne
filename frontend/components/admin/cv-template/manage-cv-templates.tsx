"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getCVTemplates, CVTemplate } from "@/api/cvapi"
import { useLanguage } from "@/providers/global_provider"

export function ManageCVTemplates() {
  const { t } = useLanguage()
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getCVTemplates()
        setTemplates(data)
      } catch (error) {
        console.error("Failed to fetch CV templates:", error)
      }
    }
    fetchTemplates()
  }, [])

  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Professional":
        return "bg-blue-100 text-blue-800"
      case "Creative":
        return "bg-purple-100 text-purple-800"
      case "Minimalist":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.admin.cvTemplate.title}</h1>
          <p className="text-muted-foreground">{t.admin.cvTemplate.desc}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              {t.admin.cvTemplate.addTemplate}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t.admin.cvTemplate.dialog.addTitle}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="templateName">{t.admin.cvTemplate.dialog.templateName}</Label>
                <Input id="templateName" placeholder={t.admin.cvTemplate.dialog.enterName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">{t.admin.cvTemplate.dialog.category}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t.admin.cvTemplate.dialog.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">{t.admin.cvTemplate.categories.professional}</SelectItem>
                    <SelectItem value="creative">{t.admin.cvTemplate.categories.creative}</SelectItem>
                    <SelectItem value="minimalist">{t.admin.cvTemplate.categories.minimalist}</SelectItem>
                    <SelectItem value="modern">{t.admin.cvTemplate.categories.modern}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t.admin.cvTemplate.dialog.description}</Label>
                <Textarea id="description" placeholder={t.admin.cvTemplate.dialog.enterDesc} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">{t.admin.cvTemplate.dialog.status}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t.admin.cvTemplate.dialog.selectStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.admin.cvTemplate.status.active}</SelectItem>
                    <SelectItem value="draft">{t.admin.cvTemplate.status.draft}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t.admin.cvTemplate.dialog.cancel}
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>{t.admin.cvTemplate.dialog.create}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.admin.cvTemplate.title} ({filteredTemplates.length})</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.admin.cvTemplate.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.cvTemplate.table.template}</TableHead>
                <TableHead>{t.admin.cvTemplate.table.category}</TableHead>
                <TableHead>{t.admin.cvTemplate.table.status}</TableHead>
                <TableHead>{t.admin.cvTemplate.table.downloads}</TableHead>
                <TableHead className="text-right">{t.admin.cvTemplate.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-9 bg-gray-100 rounded border flex items-center justify-center">
                        <img
                          src={template.imageUrl || "/placeholder.svg"}
                          alt={template.title}
                          className="h-full w-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{template.title}</div>
                        <div className="text-sm text-muted-foreground">ID: {template._id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor("Professional")}>{t.admin.cvTemplate.categories.professional}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor("Active")}>{t.admin.cvTemplate.status.active}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      N/A
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          {t.admin.cvTemplate.actions.preview}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          {t.admin.cvTemplate.actions.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          {t.admin.cvTemplate.actions.download}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t.admin.cvTemplate.actions.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
