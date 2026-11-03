from rest_framework import serializers, viewsets, permissions
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user_email', 'action', 'entity_type', 'entity_id', 'ip_address', 'details', 'timestamp']


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().select_related('user').order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['action', 'entity_type']
    search_fields = ['action', 'entity_id', 'user__email']
