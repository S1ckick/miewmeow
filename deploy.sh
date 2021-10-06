#!/bin/bash
python3 -m venv env
source env/bin/activate
wget https://github.com/Kitware/CMake/releases/download/v3.21.3/cmake-3.21.3.tar.gz
tar -xvzf cmake-3.21.3.tar.gz
rm -r cmake-3.21.3.tar.gz
cd cmake-3.21.3
cd ..
rm -r cmake-3.21.3
wget https://jztkft.dl.sourceforge.net/project/swig/swig/swig-4.0.2/swig-4.0.2.tar.gz
tar -xvzf swig-4.0.2.tar.gz
rm -r swig-4.0.2.tar.gz
cd swig-4.0.2
./configure --prefix=$PWD/../env/ --without-pcre
make
make install
cd ..
rm -r swig-4.0.2
wget https://github.com/openbabel/openbabel/archive/refs/tags/openbabel-3-1-1.tar.gz
tar -xvzf openbabel-3-1-1.tar.gz
rm -r openbabel-3-1-1.tar.gz
mkdir ob-build
cd ob-build
./$PWD/../env/bin/cmake ../openbabel-openbabel-3-1-1 -DPYTHON_BINDINGS=ON -DRUN_SWIG=ON -DCMAKE_INSTALL_PREFIX=$PWD/../env/
make -j$(nproc --all) install
cd ../
cd rm -r ob-build
cd rm -r openbabel-openbabel-3-1-1
pip install plip --no-deps
pip install numpy
pip install flask
pip install requests
bash build_miew.sh