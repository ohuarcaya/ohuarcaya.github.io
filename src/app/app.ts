import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // Datos principales
  novios = { el: 'Jean Carlo', ella: 'Danaika' };
  fecha = 'Sábado 28 de Febrero del 2026';
  
  padresNovio = { papa: 'Aurelio Mayta Lima', mama: 'Elsa Calderon Quispe' };
  padresNovia = { papa: 'Meliton Huarcaya Paira', mama: 'Gladys Canal de Huarcaya' };

  // Cronograma e Itinerario
  cronograma = [
    {
      hora: '1:00 PM',
      titulo: 'Ceremonia Religiosa',
      lugar: 'Parroquia Santisimo Nombre de Jesús',
      direccion: 'Las Garzas 188, San Borja',
      mapaUrl: 'https://maps.google.com/?q=Parroquia+Santisimo+Nombre+de+Jesus+San+Borja'
    },
    {
      hora: '4:00 PM',
      titulo: 'Recepción',
      lugar: 'Kuyayky Lodge',
      direccion: 'MZ H LOTE 170, PACHACAMAC',
      mapaUrl: 'https://maps.google.com/?q=Kuyayky+Lodge+Pachacamac'
    },
    {
      hora: '5:00 PM',
      titulo: 'Brindis',
      lugar: 'Kuyayky Lodge',
      direccion: 'Área principal',
      mapaUrl: ''
    }
  ];

  // Detalles adicionales
  detalles = {
    dressCode: 'Elegante',
    pase: 'PASE PARA 2',
    notaNinos: 'Niños, buenas noches. Adultos ¡Buena noche!'
  };

  // Datos del Colectivo / Cuentas
  cuentas = [
    {
      banco: 'BBVA',
      titular: 'Danaika Fernanda Huarcaya Canal',
      cuenta: '0011-0361-0200347203',
      cci: '01136100020034720338'
    },
    {
      banco: 'BBVA',
      titular: 'Jean Carlo Mayta Calderón',
      cuenta: '0011-0106-0200444503',
      cci: '01110600020044450323'
    }
  ];

  billeteras = {
    plataformas: 'YAPE | PLIN',
    numeros: ['976 316 979', '974794977']
  };

  gallery = [
    { src: '/photos/foto1.png', alt: 'Foto del novio 1', caption: 'Jean en una sonrisa especial' },
    { src: '/photos/foto2.png', alt: 'Foto del novio 2', caption: 'Jean disfrutando el día' },
    { src: '/photos/foto3.png', alt: 'Foto del novio 3', caption: 'Momentos felices del novio' },
    { src: '/photos/foto4.png', alt: 'Foto del novio 4', caption: 'Jean en una sonrisa especial' },
    { src: '/photos/foto5.png', alt: 'Foto del novio 5', caption: 'Jean disfrutando el día' },
    { src: '/photos/foto6.png', alt: 'Foto del novio 6', caption: 'Momentos felices del novio' }
  ];

  palette_colors = [
    '#046307', // Verde oscuro
    '#ffb200', // Amarillo
    '#ff6f00',  // Naranja
    '#d10068', // Rosa fuerte
    '#FFB6C1', // Rosa claro
  ]

  // Link directo de WhatsApp usando encoding para los espacios
  get whatsappPlannerLink(): string {
    const mensaje = encodeURIComponent('Hola Karen, quiero confirmar mi asistencia al matrimonio de Jean Carlo y Danaika.');
    return `https://wa.me/51976316979?text=${mensaje}`;
  }
}
