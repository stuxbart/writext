from django.utils.deprecation import MiddlewareMixin
from writext import settings

class DebugDisableCSRF(MiddlewareMixin):
   def process_request(self, request):
      if settings.DEBUG:
         setattr(request, '_dont_enforce_csrf_checks', True)