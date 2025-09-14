"use client";

import { EmployeeForm, type EmployeeFormRef } from "./employee-form";
import { useRef } from "react";
import type { Employee } from "./employees-table";

interface EditEmployeeFormProps {
  employee: Employee;
  onSuccess?: () => void;
  children: React.ReactElement;
}

export function EditEmployeeForm({
  employee,
  onSuccess,
  children,
}: EditEmployeeFormProps) {
  const formRef = useRef<EmployeeFormRef>(null);

  const handleTriggerClick = () => {
    formRef.current?.openDialog();
  };

  return (
    <>
      <div onClick={handleTriggerClick}>{children}</div>
      <EmployeeForm
        ref={formRef}
        mode="edit"
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          sex: employee.sex,
          placeOfBirth: employee.placeOfBirth,
          dateOfBirth: employee.dateOfBirth,
          education: employee.education,
          maritalStatus: employee.maritalStatus,
          function: employee.function,
          deploymentLocation: employee.deploymentLocation,
          residence: employee.residence,
          phone: employee.phone,
          email: employee.email,
          photoUrl: employee.photoUrl,
        }}
        onSuccess={onSuccess}
      />
    </>
  );
}
