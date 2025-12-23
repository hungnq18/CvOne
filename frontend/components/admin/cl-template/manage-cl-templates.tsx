"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Eye,
  MoreHorizontal,
  Download,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCLTemplates, CLTemplate } from "@/api/clApi";
import { useLanguage } from "@/providers/global_provider";

export function ManageCLTemplates() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<CLTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<CLTemplate | null>(
    null
  );

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getCLTemplates();
        setTemplates(data);
      } catch (error) {}
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case "Business":
        return "bg-blue-100 text-blue-800";
      case "Technology":
        return "bg-purple-100 text-purple-800";
      case "Creative":
        return "bg-pink-100 text-pink-800";
      case "Healthcare":
        return "bg-green-100 text-green-800";
      case "Education":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.admin.clTemplate.title}
        </h1>
        <p className="text-muted-foreground">{t.admin.clTemplate.desc}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {t.admin.clTemplate.title} ({filteredTemplates.length})
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.admin.clTemplate.searchPlaceholder}
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
                <TableHead>{t.admin.clTemplate.table.template}</TableHead>
                <TableHead>{t.admin.clTemplate.table.industry}</TableHead>
                <TableHead>{t.admin.clTemplate.table.status}</TableHead>
                <TableHead className="text-right">
                  {t.admin.clTemplate.table.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{template.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {template._id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getIndustryColor("Business")}>
                      {t.admin.clTemplate.industries.business}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor("Active")}>
                      {t.admin.cvTemplate.status.active}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t.admin.clTemplate.actions.preview}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          {t.admin.clTemplate.actions.export}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t.admin.clTemplate.actions.delete}
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

      {/* Preview Template Modal */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewTemplate
                ? previewTemplate.title
                : t.admin.clTemplate.dialog.preview}
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="relative w-full max-h-[60vh] overflow-hidden rounded-lg border bg-white">
                <Image
                  src={previewTemplate.imageUrl}
                  alt={previewTemplate.title}
                  width={900}
                  height={600}
                  className="w-full h-full object-contain bg-slate-50"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
