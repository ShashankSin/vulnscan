# scan_controller.py
from time import time


class ScanController:
    def __init__(self):
        self.paused = False
        self.cancelled = False

    def pause(self):
        self.paused = True

    def resume(self):
        self.paused = False

    def cancel(self):
        self.cancelled = True

    def wait_if_paused(self):
        while self.paused:
            time.sleep(0.2)

    def check_cancel(self):
        return self.cancelled