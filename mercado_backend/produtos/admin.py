# mercado_backend/produtos/admin.py
from django.contrib import admin
from .models import Produto


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'preco', 'estoque', 'created_at')
    search_fields = ('nome',)
