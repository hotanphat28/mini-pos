#!/bin/bash

# Mini POS Reset Dev Data Script (Linux/Mac)

echo "Đang reset dữ liệu của môi trường DEV..."
cd backend
npm run reset:dev
cd ..
