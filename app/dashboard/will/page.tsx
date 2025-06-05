"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

const guides = [
  { title: "10 checklist for creating a will", icon: "📝" },
  { title: "Why will is Important", icon: "❗" },
  { title: "Indian Legal System", icon: "⚖️" },
  { title: "Types of Wills", icon: "🔷" },
  { title: "Inheritance Planning", icon: "📅" },
  { title: "History of Wills", icon: "🕰️" },
];

export default function WillAndSuccessionPage() {
  const [showGuides, setShowGuides] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    lawyerName: "",
    lawyerNumber: "",
    description: "",
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [wills, setWills] = useState<any[]>([]);
  const [loadingWills, setLoadingWills] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(wills.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWills = wills.slice(indexOfFirstItem, indexOfLastItem);
  const [viewWill, setViewWill] = useState<any | null>(null);
  const [deleteWill, setDeleteWill] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editWill, setEditWill] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    lawyerName: "",
    lawyerNumber: "",
    description: "",
    file: null as File | null,
    attachment_url: null as string | null,
  });
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setForm((prev) => ({ ...prev, file: e.dataTransfer.files[0] }));
    }
  };

  const handleRemoveFile = () => {
    setForm((prev) => ({ ...prev, file: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Fetch wills for the current user
  async function fetchWills() {
    setLoadingWills(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWills([]);
        setLoadingWills(false);
        return;
      }
      const { data, error } = await supabase
        .from("wills")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setWills(data || []);
    } catch (e) {
      setWills([]);
    } finally {
      setLoadingWills(false);
    }
  }

  useEffect(() => {
    fetchWills();
  }, []);

  async function handleAddWill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let attachment_url = null;
    try {
      if (form.file) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const fileExt = form.file.name.split('.').pop();
        const fileName = `${Date.now()}-${form.file.name}`;
        const { data, error } = await supabase.storage.from("wills").upload(fileName, form.file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw error;
        // Get public URL
        const { data: publicUrlData } = supabase.storage.from("wills").getPublicUrl(fileName);
        attachment_url = publicUrlData?.publicUrl || null;
      }
      // Call API
      const res = await fetch("/api/wills/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          creation_date: form.date,
          lawyer_name: form.lawyerName,
          lawyer_number: form.lawyerNumber,
          description: form.description,
          attachment_url,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        toast({ title: "Will added", description: "Your will has been added successfully." });
        setForm({ title: "", date: "", lawyerName: "", lawyerNumber: "", description: "", file: null });
        setShowAddModal(false);
        fetchWills(); // Refresh wills list
      } else {
        toast({ title: "Error", description: result.error || "Failed to add will.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add will.", variant: "destructive" });
    }
  }

  async function handleDeleteWill(willId: string) {
    setDeleting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("wills").delete().eq("id", willId);
      if (error) throw error;
      toast({ title: "Will deleted", description: "The will has been deleted." });
      setDeleteWill(null);
      fetchWills();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete will.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  // Edit handlers
  function openEditModal(will: any) {
    setEditWill(will);
    setEditForm({
      title: will.title || "",
      date: will.creation_date || "",
      lawyerName: will.lawyer_name || "",
      lawyerNumber: will.lawyer_number || "",
      description: will.description || "",
      file: null,
      attachment_url: will.attachment_url || null,
    });
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditForm((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleEditRemoveFile = () => {
    setEditForm((prev) => ({ ...prev, file: null }));
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  async function handleEditWillSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditing(true);
    let attachment_url = editForm.attachment_url;
    try {
      if (editForm.file) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const fileName = `${Date.now()}-${editForm.file.name}`;
        const { data, error } = await supabase.storage.from("wills").upload(fileName, editForm.file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from("wills").getPublicUrl(fileName);
        attachment_url = publicUrlData?.publicUrl || null;
      }
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("wills").update({
        title: editForm.title,
        creation_date: editForm.date,
        lawyer_name: editForm.lawyerName,
        lawyer_number: editForm.lawyerNumber,
        description: editForm.description,
        attachment_url,
      }).eq("id", editWill.id);
      if (error) throw error;
      toast({ title: "Will updated", description: "The will has been updated successfully." });
      setEditWill(null);
      fetchWills();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update will.", variant: "destructive" });
    } finally {
      setEditing(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Will and Succession Plans</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGuides((v) => !v)}>
            <BookOpen className="mr-2 h-5 w-5" />
            {showGuides ? "Hide Guides" : "View Guides"}
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Add New Will
          </Button>
        </div>
      </div>

      {/* Add New Will Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Add New Will</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>
          <form
            onSubmit={handleAddWill}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Will Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Will Creation Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lawyer Name</label>
                <Input
                  value={form.lawyerName}
                  onChange={(e) => setForm((prev) => ({ ...prev, lawyerName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lawyer Number</label>
                <Input
                  value={form.lawyerNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, lawyerNumber: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 mt-0">Will Description</label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Attach Documents</label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[140px] bg-gray-50"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {form.file ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm text-gray-700">{form.file.name}</span>
                      <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-400 mb-2">Drag & Drop files here</span>
                      <span className="text-xs text-gray-400 mb-2">Supported format: pdf, jpg, jpeg.</span>
                      <label htmlFor="will-file-upload">
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                          Browse Files
                        </Button>
                        <input
                          id="will-file-upload"
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showGuides ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Help Guides</h2>
          <div className="flex flex-wrap gap-4 mb-8">
            {guides.map((guide) => (
              <div
                key={guide.title}
                className="flex flex-col items-center justify-center w-48 h-32 bg-gray-100 rounded-lg shadow hover:shadow-md transition p-4 cursor-pointer"
              >
                <div className="text-3xl mb-2">{guide.icon}</div>
                <div className="text-center font-medium text-gray-700 text-sm">{guide.title}</div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Will and Succession Plans</h3>
            <p className="text-gray-700 mb-2">
              A will is a legal document that outlines how a person's assets and responsibilities will be managed and distributed after their death. It ensures that the individual's wishes are carried out, providing clarity and reducing potential disputes among family members and beneficiaries. Succession planning, on the other hand, goes beyond the preparation of a will; it involves creating a structured approach to transferring leadership roles, responsibilities, or ownership of assets within a family, business, or organization. Together, a well-prepared will and a comprehensive succession plan can secure a smooth transition, protect loved ones, and preserve the legacy of the individual.
            </p>
            <p className="text-gray-700">
              A comprehensive will ensures that your assets are distributed according to your wishes and helps prevent disputes among beneficiaries. Succession planning, on the other hand, provides a structured roadmap for transferring control and ownership of your business or other key assets. This dual approach not only preserves your legacy but also minimizes potential legal complications, tax liabilities, and emotional stress for your loved ones. Engaging legal and financial professionals during this process is crucial to ensure compliance with applicable laws and to optimize the outcomes for all parties involved.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            {loadingWills ? (
              <div className="text-center text-gray-500">Loading wills...</div>
            ) : wills.length === 0 ? (
              <div className="text-center text-gray-500">No wills found. Add a new will to get started.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-gray-500">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Will Title</th>
                      <th className="px-6 py-3">Lawyer Name</th>
                      <th className="px-6 py-3">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWills.length > 0 ? (
                      currentWills.map((will) => (
                        <tr key={will.id} className="border-b text-sm hover:bg-gray-50">
                          <td className="px-6 py-4">{will.creation_date ? format(parseISO(will.creation_date), "dd-MM-yyyy") : "-"}</td>
                          <td className="px-6 py-4">{will.title}</td>
                          <td className="px-6 py-4">{will.lawyer_name || "-"}</td>
                          <td className="px-6 py-4 flex gap-2 items-center">
                            <button onClick={() => setViewWill(will)} className="text-blue-600 hover:text-blue-800" title="View">
                              <Eye className="h-5 w-5" />
                            </button>
                            <button onClick={() => openEditModal(will)} className="text-green-600 hover:text-green-800" title="Edit">
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button onClick={() => setDeleteWill(will)} className="text-red-600 hover:text-red-800" title="Delete">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No wills found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination */}
            {wills.length > 0 && (
              <div className="flex items-center justify-center border-t px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-full text-sm ${
                        currentPage === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Will Modal */}
      <Dialog open={!!viewWill} onOpenChange={() => setViewWill(null)}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Will Details</DialogTitle>
          </DialogHeader>
          {viewWill && (
            <div className="space-y-2">
              <div><span className="font-medium">Title:</span> {viewWill.title}</div>
              <div><span className="font-medium">Date:</span> {viewWill.creation_date ? format(parseISO(viewWill.creation_date), "dd-MM-yyyy") : "-"}</div>
              <div><span className="font-medium">Lawyer Name:</span> {viewWill.lawyer_name || "-"}</div>
              <div><span className="font-medium">Lawyer Number:</span> {viewWill.lawyer_number || "-"}</div>
              <div><span className="font-medium">Description:</span> {viewWill.description || "-"}</div>
              <div><span className="font-medium">Attachment:</span> {viewWill.attachment_url ? <a href={viewWill.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> : <span className="text-gray-400">-</span>}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Will Modal */}
      <Dialog open={!!editWill} onOpenChange={() => setEditWill(null)}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Will</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditWillSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Will Title</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Will Creation Date</label>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lawyer Name</label>
                <Input
                  value={editForm.lawyerName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, lawyerName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lawyer Number</label>
                <Input
                  value={editForm.lawyerNumber}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, lawyerNumber: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 mt-0">Will Description</label>
                <Textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Attach Documents</label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[140px] bg-gray-50"
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setEditForm((prev) => ({ ...prev, file: e.dataTransfer.files[0] }));
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {editForm.file ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm text-gray-700">{editForm.file.name}</span>
                      <Button variant="outline" size="sm" onClick={handleEditRemoveFile}>
                        Remove
                      </Button>
                    </div>
                  ) : editForm.attachment_url ? (
                    <div className="flex flex-col items-center gap-2">
                      <a href={editForm.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Current</a>
                      <label htmlFor="edit-will-file-upload">
                        <Button type="button" variant="secondary" onClick={() => editFileInputRef.current?.click()}>
                          Change File
                        </Button>
                        <input
                          id="edit-will-file-upload"
                          ref={editFileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleEditFileChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-400 mb-2">Drag & Drop files here</span>
                      <span className="text-xs text-gray-400 mb-2">Supported format: pdf, jpg, jpeg.</span>
                      <label htmlFor="edit-will-file-upload">
                        <Button type="button" variant="secondary" onClick={() => editFileInputRef.current?.click()}>
                          Browse Files
                        </Button>
                        <input
                          id="edit-will-file-upload"
                          ref={editFileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleEditFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setEditWill(null)} disabled={editing}>
                Cancel
              </Button>
              <Button type="submit" disabled={editing}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteWill} onOpenChange={() => setDeleteWill(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Delete Will</DialogTitle>
          </DialogHeader>
          <div className="mb-4">Are you sure you want to delete this will?</div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteWill(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDeleteWill(deleteWill?.id)} disabled={deleting}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 