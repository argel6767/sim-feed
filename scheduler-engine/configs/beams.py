import os
from pusher_push_notifications import PushNotifications
from typing import Any, Dict, List, Optional


class BeamsClient:
    beams_client: PushNotifications
    
    def __init__(self):
        self.beams_client = PushNotifications(
            instance_id=os.getenv('BEAMS_INSTANCE_ID'),
            secret_key=os.getenv('BEAMS_SECRET_KEY')
        )
    
    def publish_to_interest(self, body: Dict[str, Any], interests: List[str]):
        self.beams_client.publish_to_interests(
            interests=interests,
            publish_body=body
        )
        
class BeamsClientSingleton:
    instance: Optional[BeamsClient] = None
    
    @classmethod
    def get_beams_client(cls) -> BeamsClient:
        if cls.instance is None:
            cls.instance = BeamsClient()
        return cls.instance
