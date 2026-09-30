"""Generate synthetic datasets for Agent Sentinel demo."""
import csv
import os
import random
from datetime import datetime, timedelta

def generate_datasets(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    random.seed(42)

    # 1. Customers (sensitive PII & financial metadata)
    customers_file = os.path.join(output_dir, "customers.csv")
    first_names = ["Sarah", "Marcus", "Elena", "Liam", "Amina", "Chen", "David", "Sofia", "Tariq", "Emily", "Yuki", "Carlos"]
    last_names = ["Vance", "Kowalski", "Reyes", "O'Connor", "Diallo", "Wei", "Miller", "Santos", "Al-Mansoor", "Zhao", "Tanaka", "Gomez"]
    domains = ["example.corp", "acme-global.net", "synthetic-user.io", "testmail.org"]
    cities = ["New York", "London", "Tokyo", "Berlin", "Singapore", "Toronto", "Sydney", "San Francisco"]

    customers = []
    for i in range(1, 501):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        cid = f"CUST-{i:05d}"
        email = f"{fn.lower()}.{ln.lower()}{i}@{random.choice(domains)}"
        phone = f"+1-{random.randint(200,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}"
        address = f"{random.randint(10, 9999)} Industrial Way, {random.choice(cities)}"
        card_last4 = f"{random.randint(1000, 9999)}"
        balance = round(random.uniform(50.0, 75000.0), 2)
        tier = random.choice(["standard", "silver", "gold", "enterprise", "vip"])
        created = (datetime(2023, 1, 1) + timedelta(days=random.randint(0, 1000))).strftime("%Y-%m-%d")
        customers.append({
            "customer_id": cid,
            "full_name": f"{fn} {ln}",
            "email": email,
            "phone": phone,
            "address": address,
            "credit_card_last4": card_last4,
            "account_balance": balance,
            "account_tier": tier,
            "created_at": created
        })

    with open(customers_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(customers[0].keys()))
        writer.writeheader()
        writer.writerows(customers)

    # 2. Sales (Aggregable analytical data - non-PII operational)
    sales_file = os.path.join(output_dir, "sales.csv")
    products = [
        ("Cloud Infrastructure Node v2", "Compute", 450.00),
        ("Autonomous Agent License", "Software", 1200.00),
        ("Vector Index Storage 1TB", "Storage", 150.00),
        ("Security Audit Telemetry Add-on", "Security", 850.00),
        ("Enterprise Support Plan (Monthly)", "Support", 2500.00),
        ("Developer Seat Annual", "Software", 600.00)
    ]
    regions = ["NA-East", "NA-West", "EMEA-North", "EMEA-Central", "APAC-South", "APAC-East"]

    sales = []
    for s in range(1, 1201):
        prod_name, cat, price = random.choice(products)
        units = random.randint(1, 15)
        amount = round(price * units, 2)
        s_date = (datetime(2025, 1, 1) + timedelta(days=random.randint(0, 450))).strftime("%Y-%m-%d")
        sales.append({
            "sale_id": f"SALE-{s:06d}",
            "customer_id": random.choice(customers)["customer_id"],
            "product_name": prod_name,
            "category": cat,
            "unit_price": price,
            "units": units,
            "total_amount": amount,
            "sale_date": s_date,
            "region": random.choice(regions),
            "status": random.choice(["completed", "completed", "completed", "pending", "refunded"])
        })

    with open(sales_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(sales[0].keys()))
        writer.writeheader()
        writer.writerows(sales)

    # 3. Employees
    employees_file = os.path.join(output_dir, "employees.csv")
    departments = ["SecOps", "Engineering", "Sales", "Customer Success", "Finance", "Legal"]
    roles = ["Analyst", "Lead", "Engineer", "Manager", "Director", "VP"]
    employees = []
    for e in range(1, 151):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        dept = random.choice(departments)
        role = f"{dept} {random.choice(roles)}"
        access_lvl = "admin" if dept in ["SecOps", "Engineering"] and "Director" in role else random.choice(["standard", "elevated", "read_only"])
        employees.append({
            "employee_id": f"EMP-{e:04d}",
            "full_name": f"{fn} {ln}",
            "email": f"{fn.lower()}.{ln.lower()}@internal.corp",
            "department": dept,
            "role": role,
            "access_level": access_lvl,
            "status": "active"
        })

    with open(employees_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(employees[0].keys()))
        writer.writeheader()
        writer.writerows(employees)

    # 4. Transactions
    transactions_file = os.path.join(output_dir, "transactions.csv")
    transactions = []
    for t in range(1, 801):
        tx_amount = round(random.uniform(10.0, 15000.0), 2)
        tx_date = (datetime(2025, 6, 1) + timedelta(days=random.randint(0, 300), seconds=random.randint(0, 86400))).strftime("%Y-%m-%d %H:%M:%S")
        transactions.append({
            "transaction_id": f"TXN-{t:07d}",
            "customer_id": random.choice(customers)["customer_id"],
            "amount": tx_amount,
            "currency": "USD",
            "timestamp": tx_date,
            "status": random.choice(["SETTLED", "SETTLED", "SETTLED", "PENDING", "DECLINED"]),
            "channel": random.choice(["API", "WEB_PORTAL", "AUTOMATED_AGENT", "INVOICE"])
        })

    with open(transactions_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(transactions[0].keys()))
        writer.writeheader()
        writer.writerows(transactions)

    print(f"Generated datasets in {output_dir}")

if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "demo/datasets"
    generate_datasets(out)
