<?php

    //http://bshaffer.github.io/oauth2-server-php-docs/overview/jwt-access-tokens/

    // Autoloading (composer is preferred, but for this example let's just do this)
    require_once('OAuth2/Autoloader.php');
    require_once('DatabaseManager.php');

    OAuth2\Autoloader::register();

    //header("Content-Type: application/json");

    // your public key strings can be passed in however you like
    // (there is a public/private key pair for testing already in the oauth library)
    $publicKey  = file_get_contents('../keys/id_rsa.pub');
    $privateKey = file_get_contents('../keys/id_rsa');

    $username = '';
    $password = '';

    if (isset($_SERVER['PHP_AUTH_USER']))
        $username = $_SERVER['PHP_AUTH_USER'];
    else {
        http_response_code(400);
        echo json_encode(array('error' => 'Missing username'));
        return;
    }
    if (isset($_SERVER['PHP_AUTH_PW']))
        $password = $_SERVER['PHP_AUTH_PW'];
    else {
        http_response_code(400);
        echo json_encode(array('error' => 'Missing password'));
        return;
    }

    $dbm = new DatabaseManager();
    $dbm->open();
    $result = $dbm->read_user($username, $password);
    error_log(print_r($result, true)); 
    if (!$result['data']) {
        http_response_code(404);
        echo json_encode(array('error' => 'User not found'));
        return;
    }

    // create storage
    $storage = new OAuth2\Storage\Memory(array(
        'keys' => array(
            'public_key'  => $publicKey,
            'private_key' => $privateKey
        ),
        // add a Client ID
        'client_credentials' => array(
            $username => array('client_secret' => $password )
        ),
    ));

    $server = new OAuth2\Server($storage, array(
        'use_jwt_access_tokens' => true,
    ));
    $server->addGrantType(new OAuth2\GrantType\ClientCredentials($storage));

    error_log(print_r($storage, true));

    // send the response
    $server->handleTokenRequest(OAuth2\Request::createFromGlobals())->send();

    //$server->handleRevokeRequest(OAuth2\Request::createFromGlobals())->send();
?>