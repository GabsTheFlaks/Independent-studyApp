import requests

# 1. Login with student_seed
login_data = {"username": "student_seed", "password": "password123"}
session = requests.Session()
response = session.post("http://localhost:8000/login", data=login_data)
print("Login:", response.status_code)

# 2. Get my courses (should be 2)
response = session.get("http://localhost:8000/api/users/me/courses")
print("My courses count:", len(response.json()))

# 3. Enroll in course 3
response = session.post("http://localhost:8000/api/courses/3/enroll")
print("Enroll course 3:", response.status_code, response.json())

# 4. Get my courses (should be 3)
response = session.get("http://localhost:8000/api/users/me/courses")
print("My courses count:", len(response.json()))

# 5. Try to enroll in course 3 again (should fail)
response = session.post("http://localhost:8000/api/courses/3/enroll")
print("Enroll course 3 again:", response.status_code, response.json())
