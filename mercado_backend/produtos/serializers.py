# mercado_backend/produtos/serializers.py
from rest_framework import serializers
from .models import Produto


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco', 'estoque', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
