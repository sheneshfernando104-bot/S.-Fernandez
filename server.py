#!/usr/bin/env python3
"""
S. Fernandez Web Design & Development - Local Server
Serves static frontend files and provides a lightweight REST API for bookings and slot availability.
"""

import os
import json
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from datetime import datetime

PORT = 3000
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "bookings.json")

def ensure_data_file():
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)

def load_bookings():
    ensure_data_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {DATA_FILE}: {e}")
        return []

def save_bookings(bookings):
    ensure_data_file()
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(bookings, f, indent=2, ensure_ascii=False)

class CustomHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable caching for API responses
        if self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Friendly URL rewrite for /admin -> /admin.html
        if path == "/admin" or path == "/admin/":
            self.path = "/admin.html"
            return super().do_GET()

        # API: Get Bookings
        if path == "/api/bookings":
            bookings = load_bookings()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "data": bookings}).encode("utf-8"))
            return

        # API: Get Booked Slots for a specific date
        if path == "/api/slots":
            date = query.get("date", [""])[0]
            bookings = load_bookings()
            booked_slots = []
            for b in bookings:
                consultation = b.get("consultation", {})
                if consultation.get("date") == date and b.get("status") != "Cancelled":
                    booked_slots.append(consultation.get("time"))
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "date": date, "bookedSlots": booked_slots}).encode("utf-8"))
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/bookings":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            try:
                new_booking = json.loads(post_body.decode("utf-8"))
                bookings = load_bookings()

                # Generate reference ID if not provided
                if not new_booking.get("id"):
                    import random
                    year = datetime.now().year
                    code = random.randint(1000, 9999)
                    new_booking["id"] = f"SF-{year}-{code}"

                if not new_booking.get("createdAt"):
                    from datetime import timezone
                    new_booking["createdAt"] = datetime.now(timezone.utc).isoformat()

                if not new_booking.get("status"):
                    new_booking["status"] = "New"

                # Check if slot is already booked
                consultation = new_booking.get("consultation", {})
                req_date = consultation.get("date")
                req_time = consultation.get("time")

                if req_date and req_time:
                    for b in bookings:
                        b_cons = b.get("consultation", {})
                        if b_cons.get("date") == req_date and b_cons.get("time") == req_time and b.get("status") != "Cancelled":
                            self.send_response(409)
                            self.send_header("Content-Type", "application/json")
                            self.end_headers()
                            self.wfile.write(json.dumps({
                                "success": False,
                                "error": f"The time slot on {req_date} at {req_time} was just booked. Please pick another available time slot."
                            }).encode("utf-8"))
                            return

                bookings.insert(0, new_booking)
                save_bookings(bookings)

                self.send_response(201)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "booking": new_booking}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        self.send_response(404)
        self.end_headers()

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/bookings":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            try:
                payload = json.loads(post_body.decode("utf-8"))
                booking_id = payload.get("id")
                if not booking_id:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Booking ID required"}).encode("utf-8"))
                    return

                bookings = load_bookings()
                updated = False
                for b in bookings:
                    if b.get("id") == booking_id:
                        if "status" in payload:
                            b["status"] = payload["status"]
                        if "adminNotes" in payload:
                            b["adminNotes"] = payload["adminNotes"]
                        updated = True
                        break

                if updated:
                    save_bookings(bookings)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True, "message": "Booking updated"}).encode("utf-8"))
                else:
                    self.send_response(404)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Booking not found"}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/api/bookings":
            booking_id = query.get("id", [""])[0]
            if not booking_id:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Booking ID query parameter required"}).encode("utf-8"))
                return

            bookings = load_bookings()
            new_bookings = [b for b in bookings if b.get("id") != booking_id]
            if len(new_bookings) < len(bookings):
                save_bookings(new_bookings)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Booking deleted"}).encode("utf-8"))
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Booking not found"}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def run(server_class=ThreadingHTTPServer, handler_class=CustomHandler, port=PORT):
    ensure_data_file()
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    print("==================================================")
    print(" S. Fernandez Web Design & Development - Server")
    print("==================================================")
    print(f" -> Website:       http://localhost:{port}")
    print(f" -> Admin Portal:  http://localhost:{port}/admin.html")
    print(f" -> API Endpoints: http://localhost:{port}/api/bookings")
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
