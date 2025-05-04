import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import TextareaInput from "@/Components/TextareaInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, user, departments, roles }) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    password: "",
    password_confirmation: "",
    designation: user.designation || "",
    employee_id: user.employee_id || "",
    phone: user.phone || "",
    blood: user.blood || "",
    gender: user.gender || "",
    location: user.location || "",
    date_of_join: user.date_of_join || "",
    date_of_resign: user.date_of_resign || "",
    status: user.status,
    about: user.about || "",
    image: null,
    department_id: user.department_id || "",
    role_id: user.roles?.[0]?.id || "",
  });

  const submit = (e) => {
    e.preventDefault();
    put(route("users.update", user.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit User "{user.name}"
          </h2>
          <Link
            href={route("users.index")}
            className="bg-indigo-600 py-1 px-3 text-white rounded shadow transition-all hover:bg-indigo-700"
          >
            Back to Users
          </Link>
        </div>
      }
    >
      <Head title="Edit User" />

      <div className="py-2">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                      id="name"
                      type="text"
                      name="name"
                      value={data.name}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("name", e.target.value)}
                      required
                    />
                    <InputError message={errors.name} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                      id="email"
                      type="email"
                      name="email"
                      value={data.email}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("email", e.target.value)}
                      required
                    />
                    <InputError message={errors.email} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                      id="password"
                      type="password"
                      name="password"
                      value={data.password}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("password", e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                      id="password_confirmation"
                      type="password"
                      name="password_confirmation"
                      value={data.password_confirmation}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("password_confirmation", e.target.value)}
                    />
                  </div>

                  <div>
                    <InputLabel htmlFor="designation" value="Designation" />
                    <TextInput
                      id="designation"
                      type="text"
                      name="designation"
                      value={data.designation}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("designation", e.target.value)}
                    />
                    <InputError message={errors.designation} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="employee_id" value="Employee ID" />
                    <TextInput
                      id="employee_id"
                      type="text"
                      name="employee_id"
                      value={data.employee_id}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("employee_id", e.target.value)}
                    />
                    <InputError message={errors.employee_id} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="phone" value="Phone" />
                    <TextInput
                      id="phone"
                      type="text"
                      name="phone"
                      value={data.phone}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("phone", e.target.value)}
                    />
                    <InputError message={errors.phone} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="blood" value="Blood Group" />
                    <TextInput
                      id="blood"
                      type="text"
                      name="blood"
                      value={data.blood}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("blood", e.target.value)}
                    />
                    <InputError message={errors.blood} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="gender" value="Gender" />
                    <SelectInput
                      id="gender"
                      name="gender"
                      value={data.gender}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("gender", e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </SelectInput>
                    <InputError message={errors.gender} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="location" value="Location" />
                    <TextInput
                      id="location"
                      type="text"
                      name="location"
                      value={data.location}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("location", e.target.value)}
                    />
                    <InputError message={errors.location} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="date_of_join" value="Date of Join" />
                    <TextInput
                      id="date_of_join"
                      type="date"
                      name="date_of_join"
                      value={data.date_of_join}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("date_of_join", e.target.value)}
                    />
                    <InputError message={errors.date_of_join} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="date_of_resign" value="Date of Resign" />
                    <TextInput
                      id="date_of_resign"
                      type="date"
                      name="date_of_resign"
                      value={data.date_of_resign}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("date_of_resign", e.target.value)}
                    />
                    <InputError message={errors.date_of_resign} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="status" value="Status" />
                    <SelectInput
                      id="status"
                      name="status"
                      value={data.status}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("status", e.target.value)}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </SelectInput>
                    <InputError message={errors.status} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="department_id" value="Department" />
                    <SelectInput
                      id="department_id"
                      name="department_id"
                      value={data.department_id}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("department_id", e.target.value)}
                    >
                      <option value="">Select Department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </SelectInput>
                    <InputError message={errors.department_id} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="role_id" value="Role" />
                    <SelectInput
                      id="role_id"
                      name="role_id"
                      value={data.role_id}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("role_id", e.target.value)}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles?.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </SelectInput>
                    <InputError message={errors.role_id} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="image" value="Profile Image" />
                    <TextInput
                      id="image"
                      type="file"
                      name="image"
                      className="mt-1 block w-full"
                      onChange={(e) => setData("image", e.target.files[0])}
                    />
                    <InputError message={errors.image} className="mt-2" />
                  </div>
                </div>

                <div>
                  <InputLabel htmlFor="about" value="About" />
                  <TextareaInput
                    id="about"
                    name="about"
                    value={data.about}
                    className="mt-1 block w-full"
                    onChange={(e) => setData("about", e.target.value)}
                  />
                  <InputError message={errors.about} className="mt-2" />
                </div>

                <div className="flex items-center justify-end  mt-4">
                  <Link
                    href={route("users.index")}
                    className="bg-red-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-red-700 mr-2"
                  >
                    Cancel
                  </Link>
                  <button
                    className="bg-emerald-600 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
                    disabled={processing}
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
