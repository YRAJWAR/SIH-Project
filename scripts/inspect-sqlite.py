import sqlite3

con = sqlite3.connect('prisma/dev.db')
cur = con.cursor()
tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tables in prisma/dev.db:")
for t in tables:
    count = cur.execute(f"SELECT COUNT(*) FROM {t[0]}").fetchone()[0]
    print(f"  {t[0]}: {count} records")
con.close()
