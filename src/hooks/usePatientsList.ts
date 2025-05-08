
import { useState, useEffect } from 'react';

interface Patient {
  id: string;
  name: string;
}

export function usePatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Simulating API call with mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock patient data
        const mockPatients = [
          { id: 'p1', name: 'John Doe' },
          { id: 'p2', name: 'Jane Smith' },
          { id: 'p3', name: 'Robert Johnson' },
          { id: 'p4', name: 'Emily Davis' },
          { id: 'p5', name: 'Michael Brown' },
        ];
        
        setPatients(mockPatients);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return { patients, isLoading, isError };
}
