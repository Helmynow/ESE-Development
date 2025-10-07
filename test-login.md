# Login Test Cases

## Email and Oasis ID Authentication

### Test Credentials:
- **Email**: hani.zaki@ese.edu.eg
- **Oasis ID**: OAS001
- **Expected User**: Hani Zaki (CEO/Director, Admin)

- **Email**: nour.almasry@ese.edu.eg  
- **Oasis ID**: OAS101
- **Expected User**: Nour Al-Masry (English Language Teacher, Staff)

- **Email**: mahmoud.elkhouly@ese.edu.eg
- **Oasis ID**: OAS003
- **Expected User**: Mahmoud El-Khouly (Primary School Principal, Manager)

### Invalid Combinations:
- **Email**: invalid@ese.edu.eg
- **Oasis ID**: OAS999
- **Expected**: Login error

- **Email**: hani.zaki@ese.edu.eg
- **Oasis ID**: OAS999
- **Expected**: Login error (wrong Oasis ID)

The login form now uses email and Oasis ID instead of dropdown selection for more secure authentication.