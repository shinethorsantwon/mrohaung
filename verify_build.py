import os
import sys

print("Checking verification...")
root_dir = os.path.join("web", ".next")
found = False

if not os.path.exists(root_dir):
    print(f"Error: {root_dir} does not exist.")
    sys.exit(1)

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith((".js", ".html", ".json")):
            path = os.path.join(root, file)
            try:
                with open(path, "rb") as f:
                    content = f.read()
                    if b"localhost:5000" in content:
                        print(f"❌ FOUND localhost:5000 in {path}")
                        found = True
                    if b"127.0.0.1:5000" in content:
                        print(f"❌ FOUND 127.0.0.1:5000 in {path}")
                        found = True
            except:
                pass

if found:
    print("BUILD VERIFICATION FAILED: Localhost references found.")
    sys.exit(1)
else:
    print("✅ BUILD VERIFIED: Clean.")
    sys.exit(0)
