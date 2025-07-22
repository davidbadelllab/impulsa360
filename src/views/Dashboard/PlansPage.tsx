import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Plan {
  id?: string | number;
  _id?: string | number;
  name: string;
  description?: string;
  price_usd?: number;
  real_value_usd?: number;
  offer_percent?: number;
  is_active?: boolean;
}

const emptyPlan: Omit<Plan, 'id' | '_id'> = {
  name: '',
  description: '',
  price_usd: 0,
  real_value_usd: 0,
  offer_percent: 0,
  is_active: true,
};

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    const res = await axios.get('/api/plans');
    const data = Array.isArray(res.data) ? res.data : res.data.data || [];
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await axios.put(`/api/plans/${editing.id || editing._id}`, form);
    } else {
      await axios.post('/api/plans', form);
    }
    setModalOpen(false);
    setEditing(null);
    setForm(emptyPlan);
    fetchPlans();
  };

  const handleEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({ ...plan });
    setModalOpen(true);
  };

  const handleDelete = async (id: string | number | undefined) => {
    if (!id) return;
    if (window.confirm('¿Seguro que deseas eliminar este plan?')) {
      await axios.delete(`/api/plans/${id}`);
      fetchPlans();
    }
  };

  return (
    <motion.div
      className="p-6 min-h-screen bg-slate-50 text-slate-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Planes</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona los planes de tu sistema</p>
        </div>
        <Button onClick={() => { setModalOpen(true); setEditing(null); setForm(emptyPlan); }} className="h-9 bg-indigo-600 hover:bg-indigo-700">
          <span className="font-bold text-white tracking-wide">+ Crear nuevo plan</span>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Precio USD</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Valor real</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Oferta (%)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Activo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            <AnimatePresence>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 animate-pulse text-indigo-400">Cargando...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No hay planes registrados.</td></tr>
              ) : (
                plans.map(plan => {
                  const key = plan.id || plan._id || plan.name;
                  return (
                    <motion.tr
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{plan.name}</td>
                      <td className="px-4 py-3 max-w-xs text-xs whitespace-pre-line text-slate-600">{plan.description}</td>
                      <td className="px-4 py-3 font-mono">{plan.price_usd ?? '-'}</td>
                      <td className="px-4 py-3 font-mono">{plan.real_value_usd ?? '-'}</td>
                      <td className="px-4 py-3 font-mono">{plan.offer_percent ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                          {plan.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50" onClick={() => handleEdit(plan)}>
                          Editar
                        </Button>
                        <Button variant="destructive" className="hover:bg-red-50" onClick={() => handleDelete(plan.id || plan._id)}>
                          Eliminar
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {/* Modal para crear/editar */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200"
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-4 text-slate-800 tracking-wide">{editing ? 'Editar plan' : 'Crear plan'}</h3>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="w-full mb-2 p-2 border rounded bg-slate-50 text-slate-800 placeholder-slate-400" required />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="w-full mb-2 p-2 border rounded bg-slate-50 text-slate-800 placeholder-slate-400" />
              <input name="price_usd" type="number" value={form.price_usd} onChange={handleChange} placeholder="Precio USD" className="w-full mb-2 p-2 border rounded bg-slate-50 text-slate-800 placeholder-slate-400" required />
              <input name="real_value_usd" type="number" value={form.real_value_usd} onChange={handleChange} placeholder="Valor real USD" className="w-full mb-2 p-2 border rounded bg-slate-50 text-slate-800 placeholder-slate-400" />
              <input name="offer_percent" type="number" value={form.offer_percent} onChange={handleChange} placeholder="Oferta (%)" className="w-full mb-2 p-2 border rounded bg-slate-50 text-slate-800 placeholder-slate-400" />
              <label className="flex items-center mb-2">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="mr-2" />
                <span className="text-slate-700">Activo</span>
              </label>
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Guardar</Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlansPage; 