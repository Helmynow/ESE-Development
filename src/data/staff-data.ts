export interface StaffMember {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  department: string
  email: string
  oasisId: string
  phone?: string
  startDate?: string
  employeeId?: string
}

// Updated staff data based on the latest staff document
export const staffData: StaffMember[] = [
  // Leadership & Administration
  { 
    id: 'ceo', 
    name: 'Hani Zaki', 
    role: 'admin', 
    department: 'CEO/Director', 
    email: 'hani.zaki@ese.edu.eg',
    oasisId: 'OAS001',
    employeeId: 'ESE001'
  },
  { 
    id: 'pc-head', 
    name: 'Amira Hassan', 
    role: 'admin', 
    department: 'People & Culture Head', 
    email: 'amira.hassan@ese.edu.eg',
    oasisId: 'OAS002',
    employeeId: 'ESE002'
  },
  { 
    id: 'primary-principal', 
    name: 'Mahmoud El-Khouly', 
    role: 'manager', 
    department: 'Primary School Principal', 
    email: 'mahmoud.elkhouly@ese.edu.eg',
    oasisId: 'OAS003',
    employeeId: 'ESE003'
  },
  { 
    id: 'secondary-coordinator', 
    name: 'Ahmed Farouk', 
    role: 'manager', 
    department: 'Secondary School Coordinator', 
    email: 'ahmed.farouk@ese.edu.eg',
    oasisId: 'OAS004',
    employeeId: 'ESE004'
  },
  { 
    id: 'admin-manager', 
    name: 'Omar Abdel-Rahman', 
    role: 'manager', 
    department: 'Administration Manager', 
    email: 'omar.abdel@ese.edu.eg',
    oasisId: 'OAS005',
    employeeId: 'ESE005'
  },
  
  // Teaching Staff - Updated from new staff file
  { 
    id: 'eng-teacher-1', 
    name: 'Nour Al-Masry', 
    role: 'staff', 
    department: 'English Language Teacher', 
    email: 'nour.almasry@ese.edu.eg',
    oasisId: 'OAS101',
    employeeId: 'ESE101'
  },
  { 
    id: 'math-teacher-1', 
    name: 'Yasmin Said', 
    role: 'staff', 
    department: 'Mathematics Teacher', 
    email: 'yasmin.said@ese.edu.eg',
    oasisId: 'OAS102',
    employeeId: 'ESE102'
  },
  { 
    id: 'science-teacher-1', 
    name: 'Sara Ahmed', 
    role: 'staff', 
    department: 'Science Teacher', 
    email: 'sara.ahmed@ese.edu.eg',
    oasisId: 'OAS103',
    employeeId: 'ESE103'
  },
  { 
    id: 'arabic-teacher-1', 
    name: 'Mohamed Ali', 
    role: 'staff', 
    department: 'Arabic Language Teacher', 
    email: 'mohamed.ali@ese.edu.eg',
    oasisId: 'OAS104',
    employeeId: 'ESE104'
  },
  { 
    id: 'pe-teacher-1', 
    name: 'Tarek Hassan', 
    role: 'staff', 
    department: 'Physical Education Teacher', 
    email: 'tarek.hassan@ese.edu.eg',
    oasisId: 'OAS105',
    employeeId: 'ESE105'
  },
  { 
    id: 'art-teacher-1', 
    name: 'Dina Mansour', 
    role: 'staff', 
    department: 'Art Teacher', 
    email: 'dina.mansour@ese.edu.eg',
    oasisId: 'OAS106',
    employeeId: 'ESE106'
  },
  
  // New Teaching Staff from updated file
  { 
    id: 'history-teacher-1', 
    name: 'Khaled Mahmoud', 
    role: 'staff', 
    department: 'History Teacher', 
    email: 'khaled.mahmoud@ese.edu.eg',
    oasisId: 'OAS107',
    employeeId: 'ESE107'
  },
  { 
    id: 'geography-teacher-1', 
    name: 'Rana Sayed', 
    role: 'staff', 
    department: 'Geography Teacher', 
    email: 'rana.sayed@ese.edu.eg',
    oasisId: 'OAS108',
    employeeId: 'ESE108'
  },
  { 
    id: 'french-teacher-1', 
    name: 'Leila Boutros', 
    role: 'staff', 
    department: 'French Language Teacher', 
    email: 'leila.boutros@ese.edu.eg',
    oasisId: 'OAS109',
    employeeId: 'ESE109'
  },
  { 
    id: 'computer-teacher-1', 
    name: 'Amr Salah', 
    role: 'staff', 
    department: 'Computer Science Teacher', 
    email: 'amr.salah@ese.edu.eg',
    oasisId: 'OAS110',
    employeeId: 'ESE110'
  },
  { 
    id: 'music-teacher-1', 
    name: 'Heba Farid', 
    role: 'staff', 
    department: 'Music Teacher', 
    email: 'heba.farid@ese.edu.eg',
    oasisId: 'OAS111',
    employeeId: 'ESE111'
  },
  
  // Support Staff - Updated
  { 
    id: 'counselor-1', 
    name: 'Mona Khalil', 
    role: 'staff', 
    department: 'School Counselor', 
    email: 'mona.khalil@ese.edu.eg',
    oasisId: 'OAS201',
    employeeId: 'ESE201'
  },
  { 
    id: 'librarian-1', 
    name: 'Rania Farid', 
    role: 'staff', 
    department: 'Librarian', 
    email: 'rania.farid@ese.edu.eg',
    oasisId: 'OAS202',
    employeeId: 'ESE202'
  },
  { 
    id: 'nurse-1', 
    name: 'Fatima Omar', 
    role: 'staff', 
    department: 'School Nurse', 
    email: 'fatima.omar@ese.edu.eg',
    oasisId: 'OAS203',
    employeeId: 'ESE203'
  },
  { 
    id: 'admin-assistant-1', 
    name: 'Layla Mostafa', 
    role: 'staff', 
    department: 'Administrative Assistant', 
    email: 'layla.mostafa@ese.edu.eg',
    oasisId: 'OAS204',
    employeeId: 'ESE204'
  },
  
  // New Support Staff from updated file
  { 
    id: 'it-specialist-1', 
    name: 'Mahmoud Hassan', 
    role: 'staff', 
    department: 'IT Specialist', 
    email: 'mahmoud.hassan@ese.edu.eg',
    oasisId: 'OAS205',
    employeeId: 'ESE205'
  },
  { 
    id: 'finance-officer-1', 
    name: 'Noha Ibrahim', 
    role: 'staff', 
    department: 'Finance Officer', 
    email: 'noha.ibrahim@ese.edu.eg',
    oasisId: 'OAS206',
    employeeId: 'ESE206'
  },
  { 
    id: 'hr-coordinator-1', 
    name: 'Mariam Youssef', 
    role: 'staff', 
    department: 'HR Coordinator', 
    email: 'mariam.youssef@ese.edu.eg',
    oasisId: 'OAS207',
    employeeId: 'ESE207'
  },
  { 
    id: 'maintenance-head-1', 
    name: 'Ahmed Soliman', 
    role: 'staff', 
    department: 'Maintenance Head', 
    email: 'ahmed.soliman@ese.edu.eg',
    oasisId: 'OAS208',
    employeeId: 'ESE208'
  },
  { 
    id: 'security-supervisor-1', 
    name: 'Mohamed Ramadan', 
    role: 'staff', 
    department: 'Security Supervisor', 
    email: 'mohamed.ramadan@ese.edu.eg',
    oasisId: 'OAS209',
    employeeId: 'ESE209'
  },
  { 
    id: 'driver-1', 
    name: 'Hassan Ali', 
    role: 'staff', 
    department: 'School Bus Driver', 
    email: 'hassan.ali@ese.edu.eg',
    oasisId: 'OAS210',
    employeeId: 'ESE210'
  }
]

// Helper functions for staff data
export const getStaffById = (id: string): StaffMember | undefined => {
  return staffData.find(staff => staff.id === id)
}

export const getStaffByEmailAndOasis = (email: string, oasisId: string): StaffMember | undefined => {
  return staffData.find(staff => 
    staff.email.toLowerCase() === email.toLowerCase() && 
    staff.oasisId.toLowerCase() === oasisId.toLowerCase()
  )
}

export const getStaffByRole = (role: 'admin' | 'manager' | 'staff'): StaffMember[] => {
  return staffData.filter(staff => staff.role === role)
}

export const getStaffByDepartment = (department: string): StaffMember[] => {
  return staffData.filter(staff => staff.department.toLowerCase().includes(department.toLowerCase()))
}

export const getAllStaff = (): StaffMember[] => {
  return staffData
}