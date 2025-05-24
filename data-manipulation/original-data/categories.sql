-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 22, 2025 at 02:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test`
--

-- --------------------------------------------------------

--
-- Table structure for table `u24569039_products`
--

CREATE TABLE `u24569039_products` (
  `id` int(11) NOT NULL,
  `title` text DEFAULT NULL,
  `brand` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `initial_price` double DEFAULT NULL,
  `final_price` double DEFAULT NULL,
  `currency` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `product_dimensions` text DEFAULT NULL,
  `date_first_available` text DEFAULT NULL,
  `manufacturer` text DEFAULT NULL,
  `category` text DEFAULT NULL,
  `features` text DEFAULT NULL,
  `in_stock` tinyint(1) DEFAULT NULL,
  `images` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `u24569039_products`
--

INSERT INTO `u24569039_products` (`category`) VALUES
('Electronics'),
('Office Products'),
('Cell Phones & Accessories'),
('Patio, Lawn & Garden'),
('Arts, Crafts & Sewing'),
('Health & Household'),
('Tools & Home Improvement'),
('Home & Kitchen'),
('Clothing, Shoes & Jewelry'),
('Industrial & Scientific'),
('Hunting & Fishing'),
('Baby Products'),
('Sports & Outdoors'),
('Toys & Games'),
('Automotive'),
('Video Games');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
