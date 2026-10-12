from app.skills import extract_skills

sample_text= """
I am a Python developer with experience in Django,
FastAPI, Flask, MySQL, MongoDB, JavaScript,
Pandas, NumPy, TensorFlow, Git and Linux.
"""

skills= extract_skills(sample_text)

print("skills found:")
print(skills)
