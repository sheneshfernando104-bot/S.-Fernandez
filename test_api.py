import urllib.request
import urllib.error
import json
import sys

try:
    # 1. Test Home & Admin
    home_code = urllib.request.urlopen('http://localhost:3000/', timeout=5).getcode()
    admin_code = urllib.request.urlopen('http://localhost:3000/admin', timeout=5).getcode()
    assert home_code == 200, f"Expected 200, got {home_code}"
    assert admin_code == 200, f"Expected 200, got {admin_code}"
    print("[PASS] Static routes (/, /admin) return 200 OK")

    # 2. Test Bookings API
    res = json.loads(urllib.request.urlopen('http://localhost:3000/api/bookings', timeout=5).read().decode('utf-8'))
    assert res['success'] is True and len(res['data']) >= 3
    print(f"[PASS] Bookings API GET returned {len(res['data'])} bookings")

    # 3. Test Slot Query
    slot_res = json.loads(urllib.request.urlopen('http://localhost:3000/api/slots?date=2026-10-30', timeout=5).read().decode('utf-8'))
    assert '14:00' in slot_res['bookedSlots']
    print(f"[PASS] Slot query for 2026-10-30 returned booked slots: {slot_res['bookedSlots']}")

    # 4. Test New Booking POST
    payload = {
        "type": "Business Website",
        "businessName": "Automated Test Corp",
        "consultation": {
            "date": "2026-11-15",
            "time": "11:00",
            "timeLabel": "11:00 AM CET",
            "clientName": "Test Runner",
            "clientEmail": "runner@test.com",
            "clientPhone": "+39 340 000 0000",
            "contactMethod": "WhatsApp Call"
        },
        "estimatedPrice": "$25 - $35"
    }
    req = urllib.request.Request(
        'http://localhost:3000/api/bookings',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    post_res = json.loads(urllib.request.urlopen(req, timeout=5).read().decode('utf-8'))
    assert post_res['success'] is True
    new_id = post_res['booking']['id']
    print(f"[PASS] Created new booking with ID: {new_id}")

    # 5. Test Double-Booking Conflict (409)
    try:
        urllib.request.urlopen(req, timeout=5)
        print("[FAIL] Double-booking was allowed! Expected 409 Conflict.")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 409
        print(f"[PASS] Double-booking prevented with HTTP {e.code} Conflict")

    # 6. Test Status PATCH
    patch_payload = {
        "id": new_id,
        "status": "In Progress",
        "adminNotes": "Automated verification test completed"
    }
    patch_req = urllib.request.Request(
        'http://localhost:3000/api/bookings',
        data=json.dumps(patch_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    patch_res = json.loads(urllib.request.urlopen(patch_req, timeout=5).read().decode('utf-8'))
    assert patch_res['success'] is True
    print(f"[PASS] Updated booking {new_id} status to 'In Progress'")

    # 7. Test Clean-up DELETE
    del_req = urllib.request.Request(
        f'http://localhost:3000/api/bookings?id={new_id}',
        method='DELETE'
    )
    del_res = json.loads(urllib.request.urlopen(del_req, timeout=5).read().decode('utf-8'))
    assert del_res['success'] is True
    print(f"[PASS] Deleted temporary test booking {new_id}")

    print("\n==============================================")
    print(" ALL 7 BACKEND & CLIENT TESTS PASSED 100%!")
    print("==============================================")

except Exception as err:
    print(f"[ERROR] Test failed: {err}")
    sys.exit(1)
