"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, FileJson, FileSpreadsheet, FileType, Loader2, CheckCircle, XCircle } from "lucide-react";
import { fetchPrompts, fetchSkills, type Prompt, type Skill } from "@/lib/api/client";

type ExportFormat = "json" | "csv" | "markdown";
type ExportType = "all" | "prompts" | "skills";

export default function ImportExportPage() {
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [exportType, setExportType] = useState<ExportType>("all");
  const [exporting, setExporting] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported?: { prompts: number; skills: number };
    errors?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const response = await fetch("/api/import-export/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: exportFormat, type: exportType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Export failed");

      // Download file
      const blob = new Blob([data.data], {
        type: exportFormat === "json"
          ? "application/json"
          : exportFormat === "csv"
          ? "text/csv"
          : "text/markdown",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Export error:", error);
      alert("导出失败: " + error.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const response = await fetch("/api/import-export/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: text,
          format: "json",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed");

      setImportResult({
        success: true,
        imported: data.imported,
        errors: data.errors,
      });

      // Refresh the page after a short delay
      if (data.imported.prompts > 0 || data.imported.skills > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Import error:", error);
      setImportResult({
        success: false,
        errors: [error.message || "导入失败"],
      });
    } finally {
      setImporting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">导入导出</h1>
        <p className="text-slate-500 mt-1">批量导入或导出你的Prompt和 Skills</p>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList>
          <TabsTrigger value="export">导出数据</TabsTrigger>
          <TabsTrigger value="import">导入数据</TabsTrigger>
        </TabsList>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-8 space-y-6">
              {/* Format Selection */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">选择导出格式</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <button
                    onClick={() => setExportFormat("json")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      exportFormat === "json"
                        ? "border-violet-500 bg-violet-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <FileJson className="h-8 w-8 text-blue-500" />
                    <div className="text-center">
                      <p className="font-medium text-slate-900">JSON</p>
                      <p className="text-xs text-slate-500">完整数据格式</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setExportFormat("csv")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      exportFormat === "csv"
                        ? "border-violet-500 bg-violet-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                    <div className="text-center">
                      <p className="font-medium text-slate-900">CSV</p>
                      <p className="text-xs text-slate-500">表格格式</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setExportFormat("markdown")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      exportFormat === "markdown"
                        ? "border-violet-500 bg-violet-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <FileType className="h-8 w-8 text-purple-500" />
                    <div className="text-center">
                      <p className="font-medium text-slate-900">Markdown</p>
                      <p className="text-xs text-slate-500">文档格式</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Type Selection */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">选择要导出的数据</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setExportType("all")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      exportType === "all"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setExportType("prompts")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      exportType === "prompts"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    仅Prompt
                  </button>
                  <button
                    onClick={() => setExportType("skills")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      exportType === "skills"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    仅 Skills
                  </button>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={exporting}
                className="btn-primary h-12 px-6"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    导出数据
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-8 space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-violet-400 transition-colors">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">
                  拖放文件到这里或点击上传
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  支持 JSON 格式（从本应用导出的文件）
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      导入中...
                    </>
                  ) : (
                    "选择文件"
                  )}
                </Button>
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`p-4 rounded-xl ${
                  importResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${importResult.success ? "text-green-900" : "text-red-900"}`}>
                        {importResult.success ? "导入成功" : "导入失败"}
                      </p>
                      {importResult.imported && (
                        <p className="text-sm text-green-700 mt-1">
                          已导入 {importResult.imported.prompts} 个Prompt，{importResult.imported.skills} 个 Skills
                        </p>
                      )}
                      {importResult.errors && importResult.errors.length > 0 && (
                        <ul className="text-sm text-red-700 mt-2 space-y-1">
                          {importResult.errors.map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-medium text-slate-900 mb-2">导入说明</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• 支持从本应用导出的 JSON 格式文件</li>
                  <li>• 如果标题相同的项目已存在，将跳过导入</li>
                  <li>• 导入时会自动创建不存在的分类和标签</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
