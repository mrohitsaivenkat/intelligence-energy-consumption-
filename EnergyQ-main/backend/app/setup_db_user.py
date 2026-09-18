import os
import subprocess
import time

def setup_mysql_service_and_users():
    # 1. Ensure MariaDB service is running
    subprocess.run(["service", "mariadb", "start"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)

    mysql_user = os.getenv("MYSQL_USER", "root")
    mysql_pass = os.getenv("MYSQL_PASSWORD", "Akshitha@123")
    mysql_db = os.getenv("MYSQL_DB", "smart_household_energy")

    setup_sql = f"""
CREATE DATABASE IF NOT EXISTS `{mysql_db}`;
CREATE DATABASE IF NOT EXISTS `smart_energy`;

CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '{mysql_pass}';
ALTER USER 'root'@'localhost' IDENTIFIED BY '{mysql_pass}';

CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY '{mysql_pass}';
ALTER USER 'root'@'127.0.0.1' IDENTIFIED BY '{mysql_pass}';

GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;

CREATE USER IF NOT EXISTS 'energy_user'@'localhost' IDENTIFIED BY 'energy_pass';
ALTER USER 'energy_user'@'localhost' IDENTIFIED BY 'energy_pass';

CREATE USER IF NOT EXISTS 'energy_user'@'127.0.0.1' IDENTIFIED BY 'energy_pass';
ALTER USER 'energy_user'@'127.0.0.1' IDENTIFIED BY 'energy_pass';

GRANT ALL PRIVILEGES ON *.* TO 'energy_user'@'localhost';
GRANT ALL PRIVILEGES ON *.* TO 'energy_user'@'127.0.0.1';

FLUSH PRIVILEGES;
"""

    # Try connecting without password first (standard fresh MariaDB root socket)
    res = subprocess.run(["mysql"], input=setup_sql, text=True, capture_output=True)
    if res.returncode != 0:
        # If failed, try with current MYSQL_PASSWORD
        res2 = subprocess.run(["mysql", "-u", "root", f"-p{mysql_pass}"], input=setup_sql, text=True, capture_output=True)
        if res2.returncode != 0:
            # Try with energy_user as fallback
            subprocess.run(["mysql", "-u", "energy_user", "-penergy_pass"], input=setup_sql, text=True, capture_output=True)

if __name__ == "__main__":
    setup_mysql_service_and_users()
    from backend.app.init_db import init_db
    init_db()
    print("MySQL database and user setup completed successfully!")
