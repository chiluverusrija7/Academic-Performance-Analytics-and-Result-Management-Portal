import psycopg2

def insert_admin():
    conn = psycopg2.connect(dbname='EduInsight', user='postgres', password='12345', host='localhost', port=5432)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO users (user_id, username, password_hash, name, email, phone_no, role, is_active)
        VALUES (999, 'admin', 'admin123', 'System Administrator', 'admin@eduinsight.edu', '9876543210', 'ADMIN', true)
        ON CONFLICT (user_id) DO UPDATE 
        SET username = 'admin', password_hash = 'admin123', role = 'ADMIN', is_active = true;
    """)
    conn.commit()
    cur.execute("SELECT user_id, username, password_hash, role FROM users WHERE username = 'admin';")
    print("User in DB:", cur.fetchall())
    conn.close()

if __name__ == '__main__':
    insert_admin()
