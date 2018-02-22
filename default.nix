with import <nixpkgs> {};
stdenv.mkDerivation rec {
  name = "nixos-packages-explorer-env";
  buildInputs = [
    nodejs-6_x
    yarn
    python
  ];
}
