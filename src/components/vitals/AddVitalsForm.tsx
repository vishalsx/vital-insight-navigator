
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface AddVitalsFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddVitalsForm = ({ patientId, onSuccess, onCancel }: AddVitalsFormProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    weight: "",
    height: "",
  });

  const calculateBMI = useCallback((weightKg: number, heightCm: number) => {
    if (weightKg > 0 && heightCm > 0) {
      const heightM = heightCm / 100;
      return Number((weightKg / (heightM * heightM)).toFixed(2));
    }
    return null;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Parse values to appropriate types
      const systolic = formData.systolic ? parseInt(formData.systolic) : null;
      const diastolic = formData.diastolic ? parseInt(formData.diastolic) : null;
      const pulse = formData.pulse ? parseInt(formData.pulse) : null;
      const weight = formData.weight ? parseFloat(formData.weight) : null;
      const height = formData.height ? parseFloat(formData.height) : null;
      
      // Calculate BMI
      const bmi = (weight && height) ? calculateBMI(weight, height) : null;
      
      console.log("Submitting vital measurements:", {
        patient_id: patientId,
        systolic_pressure: systolic,
        diastolic_pressure: diastolic,
        pulse_rate: pulse,
        weight: weight,
        height: height,
        bmi: bmi,
        measured_at: new Date().toISOString(),
      });
      
      // Insert record into Supabase
      const { error } = await supabase
        .from('patient_vitals')
        .insert({
          patient_id: patientId,
          systolic_pressure: systolic,
          diastolic_pressure: diastolic,
          pulse_rate: pulse,
          weight: weight,
          height: height,
          bmi: bmi,
          measured_at: new Date().toISOString(), // Ensure we send the measured_at timestamp
        });

      if (error) {
        console.error("Error inserting vital measurements:", error);
        throw error;
      }

      toast({
        title: "Measurements added",
        description: "Vital measurements have been recorded successfully.",
      });

      onSuccess();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error adding measurements",
        description: "Failed to save vital measurements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="systolic">Systolic Pressure (mmHg)</Label>
          <Input
            id="systolic"
            type="number"
            value={formData.systolic}
            onChange={(e) => setFormData(prev => ({ ...prev, systolic: e.target.value }))}
            placeholder="120"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="diastolic">Diastolic Pressure (mmHg)</Label>
          <Input
            id="diastolic"
            type="number"
            value={formData.diastolic}
            onChange={(e) => setFormData(prev => ({ ...prev, diastolic: e.target.value }))}
            placeholder="80"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
        <Input
          id="pulse"
          type="number"
          value={formData.pulse}
          onChange={(e) => setFormData(prev => ({ ...prev, pulse: e.target.value }))}
          placeholder="72"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            placeholder="70.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            placeholder="170"
          />
        </div>
      </div>

      {formData.weight && formData.height && (
        <div className="text-sm text-muted-foreground">
          Calculated BMI: {calculateBMI(Number(formData.weight), Number(formData.height))}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Measurements"}
        </Button>
      </div>
    </form>
  );
};

export default AddVitalsForm;
