
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PatientEditDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  patient?: Partial<{
    id: string;
    name: string;
    gender: string;
    age: number;
    contact: string;
    condition: string;
    status: string;
    dob: string;
    address: string;
    email: string;
    insurance: string;
    blood_type: string;
    allergies: string;
    emergency_contact: string;
  }> | null;
}

export default function PatientEditDialog({
  open,
  onOpenChange,
  onSuccess,
  patient,
}: PatientEditDialogProps) {
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (patient) {
      Object.entries(patient).forEach(([key, value]) => setValue(key as any, value));
    } else {
      reset();
    }
  }, [patient, setValue, reset]);

  const onSubmit = async (values: any) => {
    // If patient exists, update; else, insert
    if (patient?.id) {
      const { error } = await supabase
        .from("patients")
        .update({
          ...values,
          dob: values.dob || null,
          status: values.status || "Active",
        })
        .eq("id", patient.id);

      if (error) {
        toast({ title: "Failed to update patient", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Patient updated" });
        onOpenChange(false);
        onSuccess();
      }
    } else {
      const { error } = await supabase.from("patients").insert({
        ...values,
        dob: values.dob || null,
        status: values.status || "Active",
      });
      if (error) {
        toast({ title: "Failed to add patient", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Patient added" });
        onOpenChange(false);
        onSuccess();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{patient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
        </DialogHeader>
        <form id="patientEditForm" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Full Name" {...register("name", { required: true })} />
          <Input placeholder="Gender" {...register("gender")} />
          <Input placeholder="Date of Birth (YYYY-MM-DD)" {...register("dob")} />
          <Input placeholder="Phone" {...register("phone")} />
          <Input placeholder="Email" {...register("email")} />
          <Input placeholder="Condition" {...register("condition")} />
          <Input placeholder="Blood Type" {...register("blood_type")} />
          <Input placeholder="Allergies" {...register("allergies")} />
          <Input placeholder="Emergency Contact" {...register("emergency_contact")} />
          <Input placeholder="Address" {...register("address")} />
          <Input placeholder="Insurance" {...register("insurance")} />
        </form>
        <DialogFooter>
          <Button form="patientEditForm" type="submit">{patient ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
