import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Select,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  InputAdornment,
  Container,
  Paper,
  Fade,
  Grow,
} from '@pankod/refine-mui';
import {
  Search,
  LocationOn,
  AttachMoney,
  Home,
  Business,
  Apartment,
  Terrain,
  Villa,
  FilterList,
} from '@mui/icons-material';
import { useTable } from '@pankod/refine-core';
import { useNavigate } from '@pankod/refine-react-router-v6';

import { PropertyCardProps } from 'interfaces/property';

const PropertiesLanding = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    tableQueryResult: { data, isLoading, isError },
    current,
    setCurrent,
    setPageSize,
    pageCount,
    sorter,
    setSorter,
    filters,
    setFilters
  } = useTable();

  const allProperties = data?.data ?? [];

  const propertyTypes = [
    { value: '', label: 'All Types', icon: <Home /> },
    { value: 'apartment', label: 'Apartment', icon: <Apartment /> },
    { value: 'house', label: 'House', icon: <Home /> },
    { value: 'office', label: 'Office', icon: <Business /> },
    { value: 'land', label: 'Land', icon: <Terrain /> },
    { value: 'townhouse', label: 'Townhouse', icon: <Villa /> },
    { value: 'condos', label: 'Condos', icon: <Apartment /> },
    { value: 'farmhouse', label: 'Farmhouse', icon: <Villa /> },
    { value: 'studio', label: 'Studio', icon: <Apartment /> },
    { value: 'chalet', label: 'Chalet', icon: <Villa /> },
  ];

  const currentFilterValues = useMemo(() => {
    const logicalFilters = filters.flatMap((item) =>
      ('field' in item ? item : []));

    return {
      title: logicalFilters.find((item) => item.field === 'title')?.value || '',
      propertyType: logicalFilters.find((item) => item.field === 'propertyType')?.value || '',
    };
  }, [filters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters([
      {
        field: 'title',
        operator: 'contains',
        value: value || undefined,
      }
    ]);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    setFilters([
      {
        field: 'propertyType',
        operator: 'eq',
        value: type || undefined,
      }
    ], 'replace');
  };

  const toggleSort = (field: string) => {
    const currentSort = sorter.find((item) => item.field === field)?.order;
    setSorter([{ field, order: currentSort === 'asc' ? 'desc' : 'asc' }]);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="#808191">Loading properties...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="#FF0000">Error loading properties. Please try again.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            fontWeight={700}
            textAlign="center"
            mb={2}
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Discover Your Dream Property
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            mb={4}
            sx={{ opacity: 0.9, fontWeight: 300 }}
          >
            Find the perfect property from our extensive collection
          </Typography>

          {/* Search Bar */}
          <Box display="flex" justifyContent="center" mb={4}>
            <Paper
              elevation={3}
              sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', md: '600px' },
                borderRadius: 3,
              }}
            >
              <TextField
                fullWidth
                placeholder="Search properties by title..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { border: 'none' } }}
              />
              <Button
                variant="contained"
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  ml: 1,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <FilterList />
              </Button>
            </Paper>
          </Box>

          {/* Property Type Filters */}
          <Fade in={showFilters}>
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
              {propertyTypes.map((type) => (
                <Chip
                  key={type.value}
                  icon={type.icon}
                  label={type.label}
                  onClick={() => handleTypeFilter(type.value)}
                  variant={selectedType === type.value ? 'filled' : 'outlined'}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&.MuiChip-filled': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    }
                  }}
                />
              ))}
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Results Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" fontWeight={600} color="#11142D">
            {allProperties.length === 0
              ? 'No properties found'
              : `${allProperties.length} Properties Found`
            }
          </Typography>

          <Box display="flex" gap={2} alignItems="center">
            <Button
              variant="outlined"
              onClick={() => toggleSort('price')}
              startIcon={<AttachMoney />}
              sx={{ borderRadius: 2 }}
            >
              Price {sorter.find(s => s.field === 'price')?.order === 'asc' ? '↑' : '↓'}
            </Button>
          </Box>
        </Box>

        {/* Properties Grid */}
        <Grid container spacing={3} mb={4}>
          {allProperties.map((property, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={property._id}>
              <Grow in={true} timeout={index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => navigate(`/properties/show/${property._id}`)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={property.photo}
                      alt={property.title}
                      sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                    <Chip
                      label={`₱${property.price.toLocaleString()}`}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'rgba(46, 212, 128, 0.9)',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="#11142D"
                      mb={1}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.3,
                      }}
                    >
                      {property.title}
                    </Typography>

                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationOn sx={{ fontSize: 16, color: '#808191', mr: 0.5 }} />
                      <Typography
                        variant="body2"
                        color="#808191"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {property.location}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={property.propertyType}
                        size="small"
                        variant="outlined"
                        sx={{
                          textTransform: 'capitalize',
                          borderColor: '#2ED480',
                          color: '#2ED480',
                        }}
                      />
                      <Typography variant="body2" color="#475BE8" fontWeight={500}>
                        View Details →
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {allProperties.length > 0 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
            mb={6}
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              onClick={() => setCurrent((prev) => prev - 1)}
              disabled={current <= 1}
              sx={{ borderRadius: 2 }}
            >
              Previous
            </Button>

            <Typography variant="body1" color="#11142D" sx={{ mx: 2 }}>
              Page <strong>{current}</strong> of <strong>{pageCount}</strong>
            </Typography>

            <Button
              variant="outlined"
              onClick={() => setCurrent((prev) => prev + 1)}
              disabled={current >= pageCount}
              sx={{ borderRadius: 2 }}
            >
              Next
            </Button>

            <Select
              value={10}
              onChange={(e) => setPageSize(Number(e.target.value))}
              size="small"
              sx={{ ml: 2, borderRadius: 2 }}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <MenuItem key={size} value={size}>
                  Show {size}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        {/* Call to Action */}
        {allProperties.length === 0 && (
          <Box
            textAlign="center"
            py={8}
            sx={{
              backgroundColor: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h5" color="#11142D" mb={2}>
              No Properties Found
            </Typography>
            <Typography variant="body1" color="#808191" mb={4}>
              Try adjusting your search criteria or browse all properties.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setFilters([]);
              }}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                backgroundColor: '#2ED480',
                '&:hover': { backgroundColor: '#25B86F' }
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PropertiesLanding;