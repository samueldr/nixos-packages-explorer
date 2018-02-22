{ pkgs ? import <nixpkgs> {} }:
with pkgs;
stdenv.mkDerivation rec {
  name = "nixos-packages-explorer-env";
  buildInputs = [
    nodejs-6_x
    yarn
    python
  ];

  # Allows use of a tarball URL.
  release = (import ./release.nix {inherit pkgs;});
}
