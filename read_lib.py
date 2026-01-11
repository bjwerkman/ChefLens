
try:
    with open("venv/lib/python3.12/site-packages/cookidoo_api/cookidoo.py", "r") as f:
        print(f.read())
except Exception as e:
    print(f"Error: {e}")
