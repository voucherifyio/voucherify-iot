Voucherify IoT
==============

Hardware
--------
- Raspberry Pi 3
- EXPLORE-NFC

Setup
-----
- Raspbian
- [NFC](http://www.nxp.com/products/identification-and-security/nfc-and-reader-ics/nfc-frontend-solutions/explore-nfc-exclusive-from-element14:PNEV512R?)
Download proper package and run:
```
sudo dpkg -i libneardal0_<version>_armhf.deb libwiringpi2-<version>_armhf.deb
neard-explorenfc_<version>_armhf.deb
```
Reboot, then test read with```explorenfc-basic```
- [nvm](https://github.com/creationix/nvm)
```nvm i stable```
