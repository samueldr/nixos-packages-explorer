let
  pkgs = import ./pkgs.nix;
  inherit (pkgs) lib;
in
pkgs.yarn2nix.mkYarnPackage {
  name = "nixos-packages-explorer";
  src = lib.cleanSource ./.;
  packageJson = ./package.json;
  yarnLock = ./yarn.lock;
  yarnNix = ./yarn.nix;

  # As a frontend package, we need to override installPhase
  installPhase = ''
    mkdir -p $out
    ( # Don't clobber path outside
    PATH="$(yarn bin):$PATH"
    webpack -p --output-path $out
    )
  '';

  # yarn2nix doesn't support disabling distPhase through `doDist = false`.
  distPhase = ":";
}
