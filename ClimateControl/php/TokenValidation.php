<?php

//http://bshaffer.github.io/oauth2-server-php-docs/overview/jwt-access-tokens/

function isTokenValid() {
    // Autoloading (composer is preferred, but for this example let's just do this)
    require_once('OAuth2/Autoloader.php');
    OAuth2\Autoloader::register();

    /* for a Resource Server (minimum config) */
    $publicKey  = file_get_contents('../keys/id_rsa.pub');

    // no private key necessary
    $keyStorage = new OAuth2\Storage\Memory(array('keys' => array(
        'public_key'  => $publicKey,
    )));

    $server = new OAuth2\Server($keyStorage, array(
        'use_jwt_access_tokens' => true,
    ));

    // verify the JWT Access Token in the request
    if (!$server->verifyResourceRequest(OAuth2\Request::createFromGlobals())) {
        //exit("Failed");
        return false;
    }

    return true;
}

?>