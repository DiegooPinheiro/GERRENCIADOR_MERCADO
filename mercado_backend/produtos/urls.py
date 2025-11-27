# mercado_backend/produtos/urls.py
from rest_framework import routers
from .views import ProdutoViewSet


router = routers.DefaultRouter()
router.register(r'produtos', ProdutoViewSet, basename='produto')


urlpatterns = router.urls