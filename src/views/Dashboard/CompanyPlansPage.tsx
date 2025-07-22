import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';

interface Plan {
  _id: string;
  name: string;
  description?: string;
}

interface CompanyPlan {
  _id: string;
  plan: Plan;
  start_date: string;
  payment_due_date: string;
  payment_status: 'pagado' | 'moroso' | 'pendiente';
}

const statusOptions = [
  { value: 'pagado', label: 'Pagado' },
  { value: 'moroso', label: 'Moroso' },
  { value: 'pendiente', label: 'Pendiente' },
];

const CompanyPlansPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [companyPlans, setCompanyPlans] = useState<CompanyPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanyPlans = async () => {
    setLoading(true);
    const res = await axios.get(`/api/companies/${companyId}/plans`);
    setCompanyPlans(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanyPlans();
    // eslint-disable-next-line
  }, [companyId]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await axios.put(`/api/company-plans/${id}/payment-status`, { payment_status: newStatus });
    fetchCompanyPlans();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta asignación de plan?')) {
      await axios.delete(`/api/company-plans/${id}`);
      fetchCompanyPlans();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Planes asignados a la empresa</h2>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Plan</th>
              <th className="px-4 py-2">Inicio</th>
              <th className="px-4 py-2">Próximo pago</th>
              <th className="px-4 py-2">Estado de pago</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companyPlans.map(cp => (
              <tr key={cp._id} className="border-t">
                <td className="px-4 py-2">{cp.plan?.name}</td>
                <td className="px-4 py-2">{cp.start_date?.slice(0,10)}</td>
                <td className="px-4 py-2">{cp.payment_due_date?.slice(0,10)}</td>
                <td className="px-4 py-2">
                  <select
                    value={cp.payment_status}
                    onChange={e => handleStatusChange(cp._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <Button variant="destructive" onClick={() => handleDelete(cp._id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CompanyPlansPage; 