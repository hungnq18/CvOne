"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAllUsers, deleteUser, updateUserProfile } from "@/api/userApi"
import { createAccountByAdmin, updateUserRole } from "@/api/authApi"
import { User as UserType } from "@/types/auth"
import { MoreHorizontal, ChevronDown, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/providers/global_provider"
import { Country, District, getCountries, getDistrictsByProvinceCode, getProvinces, Province } from "@/api/locationApi"
import { showErrorToast, showSuccessToast } from "@/utils/popUpUtils"

interface PopulatedAccount {
  _id: string;
  email: string;
  role: string;
}

interface PopulatedUser extends Omit<UserType, 'account_id'> {
  account_id: PopulatedAccount | null;
}

const initialFormData = {
  _id: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "user",
  countryCode: "+84",
  city: "",
  district: "",
}

// Danh sách 1 số disposable mail domain (demo, có thể mở rộng)
const DISPOSABLE_DOMAINS = [
  'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'dispostable.com', 'trashmail.com',
  'yopmail.com', 'temp-mail.org', 'maildrop.cc', 'fakeinbox.com', 'getnada.com', 'gmail.co'
];
// Chỉnh lại domain công ty ở đây nếu cần
const INTERNAL_EMAIL_DOMAIN = ''; // vd '@yourcompany.com' hoặc để '' => cho phép tất cả

export function ManageUsers() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<PopulatedUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<PopulatedUser | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const pageSize = 5

  useEffect(() => {
    fetchUsers()
    loadLocationData()
  }, [])

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedProvinceCode) {
        try {
          const districtsData = await getDistrictsByProvinceCode(selectedProvinceCode)
          setDistricts(districtsData)
        } catch (error) {
          console.error("Error loading districts:", error)
        }
      } else {
        setDistricts([])
      }
    }

    loadDistricts()
  }, [selectedProvinceCode])

  const loadLocationData = async () => {
    setLoading(true)
    try {
      const [provincesData, countriesData] = await Promise.all([
        getProvinces(),
        getCountries(),
      ])
      setProvinces(provincesData)
      setCountries(countriesData)
    } catch (error) {
      console.error("Error loading location data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      showErrorToast("Error", t.admin.manageUser.messages.fetchError)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "city") {
      const selectedProvince = provinces.find((p) => p.name === value)
      setSelectedProvinceCode(selectedProvince ? selectedProvince.code : null)
      setFormData((prev) => ({ ...prev, [field]: value, district: "" }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      showErrorToast("Validation Error", "Email is required")
      return false
    }
    if (formData.email.length > 20) {
      showErrorToast("Validation Error", "Email tối đa 20 ký tự")
      return false
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.email.trim())) {
      showErrorToast("Validation Error", "Email không đúng định dạng chuẩn")
      return false
    }

    // Check domain công ty (nếu có cấu hình)
    if (INTERNAL_EMAIL_DOMAIN && !formData.email.trim().endsWith(INTERNAL_EMAIL_DOMAIN)) {
      showErrorToast("Validation Error", `Email bắt buộc thuộc domain ${INTERNAL_EMAIL_DOMAIN}`)
      return false
    }

    // Check disposable
    const emailDomain = formData.email.split('@')[1]?.toLowerCase() || '';
    if (DISPOSABLE_DOMAINS.some(domain => emailDomain.endsWith(domain))) {
      showErrorToast("Validation Error", "Không được dùng email tạm thời/disposable trong hệ thống")
      return false
    }

    // Check trùng email (tạm thời bằng users đã fetch)
    // Nếu đang tạo mới, kiểm tra mọi tài khoản đã có
    if (!isEditMode) {
      const lowerEmail = formData.email.trim().toLowerCase();
      if (users.some((user) => user.account_id && user.account_id.email.toLowerCase() === lowerEmail)) {
        showErrorToast("Validation Error", "Email đã tồn tại trong hệ thống")
        return false
      }
    }

    // Validate first_name và last_name
    if (formData.first_name && formData.first_name.length > 10) {
      showErrorToast("Validation Error", "First name tối đa 10 ký tự")
      return false
    }
    if (formData.last_name && formData.last_name.length > 10) {
      showErrorToast("Validation Error", "Last name tối đa 10 ký tự")
      return false
    }

    if (!isEditMode) {
      if (!formData.password.trim()) {
        showErrorToast("Validation Error", "Password is required")
        return false
      }

      // Password validation: 1 uppercase, 1 special char, 1 number
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+\[\]{};:'",.<>\/?\\|`~]).{8,}$/
      if (!passwordRegex.test(formData.password)) {
        showErrorToast(
          "Invalid Password",
          "Password must contain at least 1 uppercase letter, 1 number, and 1 special character"
        )
        return false
      }
    }

    return true
  }

  const handleOpenCreateDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsEditMode(false)
    setFormData(initialFormData)
    setShowPassword(false)
    setIsFormOpen(true)
  }

  const handleOpenEditDialog = (user: PopulatedUser) => {
    setIsEditMode(true)
    setSelectedUser(user)

    // Set province code if city exists
    const userCity = user.city || ""
    if (userCity && provinces.length > 0) {
      const selectedProvince = provinces.find((p) => p.name === userCity)
      if (selectedProvince) {
        setSelectedProvinceCode(selectedProvince.code)
      }
    }

    setFormData({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.account_id?.email ?? "",
      password: "", // Password is not edited here
      role: user.account_id?.role ?? "user",
      countryCode: (user as any).countryCode || "+84",
      city: user.city || "",
      district: (user as any).district || "",
    })
    setIsFormOpen(true)
  }

  const handleSaveUser = async () => {
    if (!validateForm()) return

    try {
      if (isEditMode && selectedUser) {
        // Update user
        const updatedData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          countryCode: formData.countryCode,
          city: formData.city,
          district: formData.district,
        }
        await updateUserProfile(selectedUser._id, updatedData as any)

      if (selectedUser.account_id && formData.role !== selectedUser.account_id.role) {
        await updateUserRole(selectedUser.account_id._id, formData.role)
      }

        showSuccessToast("Success", t.admin.manageUser.messages.updateSuccess)
      } else {
        // Create user
        const newAccountData = {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          countryCode: formData.countryCode,
          city: formData.city,
          district: formData.district,
        }
        await createAccountByAdmin(newAccountData)
        showSuccessToast("Success", t.admin.manageUser.messages.createSuccess)
      }
      fetchUsers()
      setIsFormOpen(false)
      setShowPassword(false)
    } catch (error) {
      console.error("Failed to save user:", error)
      showErrorToast("Error", t.admin.manageUser.messages.saveError)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    try {
      await deleteUser(selectedUser._id)
      showSuccessToast("Success", t.admin.manageUser.messages.deleteSuccess)
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      showErrorToast("Error", t.admin.manageUser.messages.deleteError)
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const openDeleteDialog = (user: PopulatedUser) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const filteredUsers = users.filter((user) => {
    if (!user.account_id) return false

    const term = searchTerm.toLowerCase()
    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.toLowerCase()
    const email = user.account_id.email?.toLowerCase() ?? ""

    return fullName.includes(term) || email.includes(term)
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "hr":
        return "bg-purple-100 text-purple-800"
      case "mkt":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.admin.manageUser.title}</h1>
          <p className="text-muted-foreground">{t.admin.manageUser.desc}</p>
        </div>
        <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t.admin.manageUser.addUser}
        </Button>
      </div>

      {/* User Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.admin.manageUser.table.users} ({filteredUsers.length})</CardTitle>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.admin.manageUser.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col min-h-[420px]">
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.manageUser.table.user}</TableHead>
                  <TableHead>{t.admin.manageUser.table.role}</TableHead>
                  <TableHead>{t.admin.manageUser.table.email}</TableHead>
                  <TableHead>{t.admin.manageUser.table.city}</TableHead>
                  <TableHead>{t.admin.manageUser.table.district}</TableHead>
                  <TableHead className="text-right">{t.admin.manageUser.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => {
                  if (!user.account_id) return null

                  return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={"/placeholder.svg"} />
                          <AvatarFallback>
                            {`${user.first_name[0]}${user.last_name[0]}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{`${user.first_name} ${user.last_name}`}</div>
                          <div className="text-sm text-muted-foreground">{user.account_id.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.account_id.role)}>{user.account_id.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.account_id.email}
                    </TableCell>
                    <TableCell>{user.city}</TableCell>
                    <TableCell>{user.district}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t.admin.manageUser.dialog.editTitle}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t.admin.manageUser.dialog.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t.admin.manageUser.table.showing}{" "}
              {filteredUsers.length === 0
                ? 0
                : `${startIndex + 1}–${Math.min(
                    startIndex + pageSize,
                    filteredUsers.length
                  )}`}{" "}
              {t.admin.manageUser.table.of} {filteredUsers.length} {t.admin.manageUser.table.users}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage === totalPages || filteredUsers.length === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? t.admin.manageUser.dialog.editTitle : t.admin.manageUser.dialog.addTitle}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="first_name">{t.admin.manageUser.dialog.firstName}</Label>
                    <Input id="first_name" value={formData.first_name} onChange={(e) => handleInputChange("first_name", e.target.value)} maxLength={10} />
                </div>
                <div>
                    <Label htmlFor="last_name">{t.admin.manageUser.dialog.lastName}</Label>
                    <Input id="last_name" value={formData.last_name} onChange={(e) => handleInputChange("last_name", e.target.value)} maxLength={10} />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t.admin.manageUser.dialog.email} <span className="text-red-500">*</span></Label>
              <Input id="email" required type="email" value={formData.email} disabled={isEditMode} onChange={(e) => handleInputChange("email", e.target.value)} autoComplete="off" maxLength={20} />
            </div>
            {!isEditMode && (
              <div className="grid gap-2">
                <Label htmlFor="password">{t.admin.manageUser.dialog.password} <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">{t.admin.manageUser.dialog.role} <span className="text-red-500">*</span></Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.admin.manageUser.dialog.selectRole} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="mkt">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="city">{t.admin.manageUser.dialog.city}</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => handleInputChange("city", value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading..." : "Select city/province"} />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.code} value={province.name}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="district">{t.admin.manageUser.dialog.district}</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => handleInputChange("district", value)}
                      disabled={loading || !selectedProvinceCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedProvinceCode ? "Select city first" : loading ? "Loading..." : "Select district"} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.code} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              {t.admin.manageUser.dialog.cancel}
            </Button>
            <Button type="button" onClick={handleSaveUser}>{t.admin.manageUser.dialog.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.manageUser.dialog.deleteTitle}</DialogTitle>
            <DialogDescription>
              {t.admin.manageUser.dialog.deleteDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t.admin.manageUser.dialog.cancel}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteUser}>
              {t.admin.manageUser.dialog.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
