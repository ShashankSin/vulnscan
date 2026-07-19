def emit_progress(socketio, module_id, status, risk=0):
    socketio.emit("scan_progress", {
        "module": module_id,
        "status": status,
        "risk": risk
    })