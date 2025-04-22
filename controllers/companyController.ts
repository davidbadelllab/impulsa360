import { Request, Response } from 'express';
import Company, { ICompany } from '../models/Company';
import { handleError } from '../utils/errorHandler';

// Interfaz para las consultas de paginación
interface PaginationQuery {
  page?: string;
  limit?: string;
  [key: string]: any;
}

// Interface básica para compañía
interface ICompany {
  id?: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
}

// Array simulado para almacenar compañías (en lugar de una base de datos)
let companies: ICompany[] = [
  {
    id: '1',
    name: 'Empresa 1',
    address: 'Dirección 1',
    email: 'empresa1@ejemplo.com',
    phone: '123456789'
  },
  {
    id: '2',
    name: 'Empresa 2',
    address: 'Dirección 2',
    email: 'empresa2@ejemplo.com',
    phone: '987654321'
  }
];

// Obtener todas las compañías
export const getAllCompanies = (req: Request, res: Response): void => {
  try {
    res.status(200).json({
      success: true,
      count: companies.length
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Obtener una compañía por ID
export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      res.status(404).json({ success: false, message: 'Compañía no encontrada' });
      return;
    }
    
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    handleError(res, error);
  }
};

// Crear una nueva compañía
export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyData: Partial<ICompany> = req.body;
    
    // Si hay un archivo de logo subido
    if (req.file) {
      companyData.logo = req.file.path;
    }
    
    const company = await Company.create(companyData);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    handleError(res, error);
  }
};

// Actualizar una compañía
export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyData: Partial<ICompany> = req.body;
    
    // Si hay un archivo de logo subido
    if (req.file) {
      companyData.logo = req.file.path;
    }
    
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      companyData,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      res.status(404).json({ success: false, message: 'Compañía no encontrada' });
      return;
    }
    
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    handleError(res, error);
  }
};

// Eliminar una compañía
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    
    if (!company) {
      res.status(404).json({ success: false, message: 'Compañía no encontrada' });
      return;
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    handleError(res, error);
  }
};
