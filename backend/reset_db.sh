#!/bin/bash
# Este script apaga o banco atual e roda o seed.py para popular as tabelas
# Útil quando voce substitui os links no seed.py e quer que o banco leia os novos links.

echo "Apagando o banco de dados antigo..."
rm -f independent_study.db

echo "Recriando as tabelas..."
python init_db.py

echo "Populando os novos dados..."
python seed.py

echo "Pronto! O banco de dados foi resetado e populado."
