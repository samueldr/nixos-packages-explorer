{ pkgs ? import (fetchTarball channel:nixos-18.09) {} }:
with pkgs;
stdenv.mkDerivation rec {
  name = "nixos-packages-explorer-env";
  buildInputs = [
    nodejs-10_x
    yarn
    python
    nix
  ];

  passthru = {
    # Allows use of a tarball URL.
    release = (import ./release.nix {inherit pkgs;});
  };
}
