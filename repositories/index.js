// Repositorio base
export { default as BaseRepository } from './BaseRepository.js';

// Repositorios específicos
export { default as UserRepository } from './UserRepository.js';
export { default as CompanyRepository } from './CompanyRepository.js';
export { default as BriefingRepository } from './BriefingRepository.js';
export { default as TaskRepository } from './TaskRepository.js';
export { default as MessageRepository } from './MessageRepository.js';
export { default as MediaRepository } from './MediaRepository.js';
export { default as BlogRepository } from './BlogRepository.js';
export { default as PlanRepository } from './PlanRepository.js';
export { default as AppointmentRepository } from './AppointmentRepository.js';
export { default as MeetingRepository } from './MeetingRepository.js';

// Función para instanciar todos los repositorios
export const createRepositories = () => {
  return {
    users: new UserRepository(),
    companies: new CompanyRepository(),
    briefings: new BriefingRepository(),
    tasks: new TaskRepository(),
    messages: new MessageRepository(),
    media: new MediaRepository(),
    blogs: new BlogRepository(),
    plans: new PlanRepository(),
    appointments: new AppointmentRepository(),
    meetings: new MeetingRepository()
  };
};

// Exportar instancias singleton
const repositories = createRepositories();
export default repositories;
