<?php

    //http://coreymaynard.com/blog/creating-a-restful-api-with-php/

    require_once 'DatabaseManagerAPI.php';

    // Requests from the same server don't have a HTTP_ORIGIN header
    if (!array_key_exists('HTTP_ORIGIN', $_SERVER)) {
        $_SERVER['HTTP_ORIGIN'] = $_SERVER['SERVER_NAME'];
    }    

    try {
        $API = new DatabaseManagerApi($_REQUEST['request'], $_SERVER['HTTP_ORIGIN']);
        echo $API->processAPI();
    } catch (Exception $e) {
        echo json_encode(Array('error' => $e->getMessage()));
    }

?>